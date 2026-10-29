import "dotenv/config";
import bcrypt from "bcryptjs";
import connectSqlite3 from "connect-sqlite3";
import express, { type NextFunction, type Request, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import session from "express-session";
import helmet from "helmet";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { courses, officialSource } from "./catalog.js";
import { database } from "./database.js";
import { loginSchema, newsSchema } from "./validation.js";

declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
    csrfToken?: string;
  }
}

const requiredEnvironment = ["SESSION_SECRET", "ADMIN_USERNAME", "ADMIN_PASSWORD_HASH"] as const;
const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key]?.trim());
if (missingEnvironment.length > 0) {
  throw new Error(`Configure as variáveis obrigatórias: ${missingEnvironment.join(", ")}`);
}
if ((process.env.SESSION_SECRET?.length ?? 0) < 32) {
  throw new Error("SESSION_SECRET deve ter pelo menos 32 caracteres.");
}
if (process.env.SESSION_SECRET?.startsWith("replace-with")) {
  throw new Error("Substitua o valor de exemplo de SESSION_SECRET por um segredo aleatório.");
}
if (!process.env.ADMIN_PASSWORD_HASH?.startsWith("$2")) {
  throw new Error("ADMIN_PASSWORD_HASH deve conter um hash bcrypt válido.");
}

const app = express();
const port = Number(process.env.PORT ?? 3000);
const dataDirectory = join(process.cwd(), "data");
mkdirSync(dataDirectory, { recursive: true });

app.disable("x-powered-by");
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  }),
);
app.use(express.json({ limit: "32kb" }));

const SqliteStore = connectSqlite3(session);
app.use(
  session({
    name: "sitech.sid",
    store: new SqliteStore({
      db: "sessions.sqlite",
      dir: dataDirectory,
      table: "sessions",
    }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60 * 1000,
    },
  }),
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
});

function csrfMatches(provided: string | undefined, expected: string | undefined): boolean {
  if (!provided || !expected) return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

function requireCsrf(req: Request, res: Response, next: NextFunction): void {
  if (!csrfMatches(req.get("x-csrf-token"), req.session.csrfToken)) {
    res.status(403).json({ error: "Token de segurança inválido. Atualize a página e tente novamente." });
    return;
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.isAdmin) {
    res.status(401).json({ error: "Entre na área administrativa para continuar." });
    return;
  }
  next();
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/courses", (_req, res) => {
  res.json({
    courses,
    source: officialSource,
    inventoryStatus: courses.length === 0 ? "pending" : "available",
  });
});

app.get("/api/news", (_req, res) => {
  const articles = database
    .prepare(
      `SELECT id, title, summary, content, created_at AS createdAt
       FROM news ORDER BY created_at DESC, id DESC`,
    )
    .all();
  res.json(articles);
});

app.get("/api/auth/csrf", (req, res) => {
  req.session.csrfToken ??= randomBytes(32).toString("hex");
  res.json({ csrfToken: req.session.csrfToken });
});

app.get("/api/auth/me", (req, res) => {
  res.json({ authenticated: Boolean(req.session.isAdmin) });
});

app.post("/api/auth/login", loginLimiter, requireCsrf, async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Informe usuário e senha válidos." });
    return;
  }

  try {
    const usernameMatches = parsed.data.username === process.env.ADMIN_USERNAME;
    const passwordMatches = await bcrypt.compare(
      parsed.data.password,
      process.env.ADMIN_PASSWORD_HASH!,
    );
    if (!usernameMatches || !passwordMatches) {
      res.status(401).json({ error: "Usuário ou senha incorretos." });
      return;
    }

    req.session.regenerate((error) => {
      if (error) {
        next(error);
        return;
      }
      req.session.isAdmin = true;
      req.session.csrfToken = randomBytes(32).toString("hex");
      req.session.save((saveError) => {
        if (saveError) {
          next(saveError);
          return;
        }
        res.json({ authenticated: true, csrfToken: req.session.csrfToken });
      });
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/logout", requireAdmin, requireCsrf, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }
    res.clearCookie("sitech.sid", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(204).end();
  });
});

app.post("/api/news", requireAdmin, requireCsrf, (req, res) => {
  const parsed = newsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Revise título, resumo e conteúdo da notícia." });
    return;
  }

  const result = database
    .prepare("INSERT INTO news (title, summary, content) VALUES (?, ?, ?)")
    .run(parsed.data.title, parsed.data.summary, parsed.data.content);
  const article = database
    .prepare(
      `SELECT id, title, summary, content, created_at AS createdAt
       FROM news WHERE id = ?`,
    )
    .get(result.lastInsertRowid);
  res.status(201).json(article);
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(join(process.cwd(), "dist")));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(join(process.cwd(), "dist", "index.html"));
  });
}

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Erro não tratado na API:", error);
  res.status(500).json({ error: "Ocorreu um erro interno. Tente novamente." });
});

app.listen(port, () => {
  console.log(`Sitech disponível na porta ${port}.`);
});
