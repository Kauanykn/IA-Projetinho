import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  apiRequest,
  Course,
  CourseCatalog,
  NewsArticle,
  initializeSecurity,
  updateCsrfToken,
} from "./api";

function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="Sitech, início">
          <span className="brand-mark">S</span>
          <span>
            <strong>sitech</strong>
            <small>ETEC SALES GOMES</small>
          </span>
        </Link>
        <nav aria-label="Navegação principal">
          <Link to="/cursos">Cursos técnicos</Link>
          <a href="/#noticias">Notícias</a>
          <Link className="admin-link" to="/admin">Área administrativa <span aria-hidden="true">↗</span></Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p><strong>Sitech</strong> · Etec Sales Gomes</p>
        <a href="https://etecsalesgomes.cps.sp.gov.br/" target="_blank" rel="noreferrer">
          Site oficial da escola <span aria-hidden="true">↗</span>
        </a>
      </div>
    </footer>
  );
}

function InventoryNotice() {
  return (
    <div className="notice" role="status">
      <span className="notice-icon" aria-hidden="true">i</span>
      <div>
        <strong>Inventário em conferência</strong>
        <p>
          A lista de cursos e matrizes será publicada após validação com as fontes
          oficiais. Nenhum curso ou disciplina foi presumido.
        </p>
        <a href="https://etecsalesgomes.cps.sp.gov.br/ensino-tecnico/" target="_blank" rel="noreferrer">
          Consultar a referência oficial <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}

function NewsList({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) {
    return <p className="empty-state">Ainda não há notícias publicadas. Volte em breve.</p>;
  }

  return (
    <div className="news-grid">
      {articles.map((article, index) => (
        <article className={`news-card ${index === 0 ? "news-card-featured" : ""}`} key={article.id}>
          <span className="eyebrow">{formatDate(article.createdAt)}</span>
          <h3>{article.title}</h3>
          <p>{article.summary}</p>
          <details>
            <summary>Leia a notícia <span aria-hidden="true">↗</span></summary>
            <p className="news-content">{article.content}</p>
          </details>
        </article>
      ))}
    </div>
  );
}

function HomePage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<NewsArticle[]>("/api/news")
      .then(setArticles)
      .catch(() => setError("As notícias não puderam ser carregadas agora."));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow eyebrow-light">FORMAÇÃO TÉCNICA · FUTURO EM MOVIMENTO</span>
          <h1>Conhecimento que<br /><em>abre caminhos.</em></h1>
          <p>Explore os cursos técnicos e fique por dentro das novidades da Etec Sales Gomes.</p>
          <Link className="button button-light" to="/cursos">Conheça os cursos <span aria-hidden="true">→</span></Link>
        </div>
        <div className="hero-decoration" aria-hidden="true">
          <span className="orbit orbit-one" /><span className="orbit orbit-two" />
          <span className="hero-number">01</span>
          <span className="hero-caption">APRENDER<br />TRANSFORMA</span>
        </div>
      </section>

      <main>
        <section className="section catalog-preview">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SEU PRÓXIMO PASSO</span>
              <h2>Formação para<br />o mundo real.</h2>
            </div>
            <p>Uma formação conectada às pessoas, à tecnologia e às oportunidades da nossa região.</p>
          </div>
          <InventoryNotice />
          <Link className="text-link" to="/cursos">Acompanhar catálogo <span aria-hidden="true">→</span></Link>
        </section>

        <section className="section news-section" id="noticias">
          <div className="section-heading section-heading-news">
            <div>
              <span className="eyebrow">ACONTECE NA ETEC</span>
              <h2>Notícias e<br />novidades.</h2>
            </div>
            <p>Informações e acontecimentos importantes da comunidade escolar.</p>
          </div>
          {error ? <p className="inline-error" role="alert">{error}</p> : <NewsList articles={articles} />}
        </section>
      </main>
    </>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Link className="course-card" to={`/cursos/${course.slug}`}>
      <span className="course-index" aria-hidden="true">CURSO TÉCNICO</span>
      <h2>{course.name}</h2>
      <p>{course.description}</p>
      <span className="course-meta">{course.duration || "Matriz curricular"} <span aria-hidden="true">↗</span></span>
    </Link>
  );
}

function CoursesPage() {
  const [catalog, setCatalog] = useState<CourseCatalog | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<CourseCatalog>("/api/courses")
      .then(setCatalog)
      .catch(() => setError("O catálogo não pôde ser carregado agora."));
  }, []);

  return (
    <main className="page-main">
      <section className="page-heading">
        <span className="eyebrow">FORMAÇÃO TÉCNICA</span>
        <h1>Cursos que conectam<br /><em>talento e oportunidade.</em></h1>
        <p>Conheça as formações técnicas e consulte suas matrizes curriculares.</p>
      </section>
      {error ? <p className="inline-error" role="alert">{error}</p> : null}
      {catalog?.inventoryStatus === "pending" ? (
        <InventoryNotice />
      ) : (
        <section className="course-grid" aria-label="Cursos técnicos">
          {catalog?.courses.map((course) => <CourseCard course={course} key={course.slug} />)}
        </section>
      )}
    </main>
  );
}

function CourseDetailPage() {
  const { slug } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<CourseCatalog>("/api/courses")
      .then((catalog) => setCourse(catalog.courses.find((item) => item.slug === slug) ?? null))
      .catch(() => setError("Os dados do curso não puderam ser carregados."));
  }, [slug]);

  if (error) return <main className="page-main"><p className="inline-error" role="alert">{error}</p></main>;
  if (!course) return <main className="page-main"><InventoryNotice /><Link className="text-link" to="/cursos">Voltar aos cursos</Link></main>;

  return (
    <main className="page-main">
      <Link className="back-link" to="/cursos">← Todos os cursos</Link>
      <section className="page-heading">
        <span className="eyebrow">CURSO TÉCNICO</span>
        <h1>{course.name}</h1>
        <p>{course.description}</p>
      </section>
      <section className="curriculum">
        <div className="curriculum-heading">
          <div><span className="eyebrow">MATRIZ CURRICULAR</span><h2>O que você vai aprender.</h2></div>
          <span className={course.isMock ? "badge badge-mock" : "badge"}>{course.isMock ? "Conteúdo temporário" : "Fonte verificada"}</span>
        </div>
        {course.disciplines.map((discipline, index) => (
          <article className="discipline" key={`${discipline.name}-${index}`}>
            <span className="discipline-number">{String(index + 1).padStart(2, "0")}</span>
            <div><h3>{discipline.name}</h3><p>{discipline.description}</p></div>
            {discipline.isMock ? <span className="badge badge-mock">Mock</span> : null}
          </article>
        ))}
        <p className="source-note">Fonte curricular: <a href={course.source} target="_blank" rel="noreferrer">{course.source}</a></p>
      </section>
    </main>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    initializeSecurity()
      .then(() => apiRequest<{ authenticated: boolean }>("/api/auth/me"))
      .then((result) => {
        setAuthenticated(result.authenticated);
        if (result.authenticated) return apiRequest<NewsArticle[]>("/api/news").then(setArticles);
      })
      .catch(() => {
        setAuthenticated(false);
        setError("Não foi possível iniciar a área administrativa. Tente novamente.");
      });
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    try {
      const result = await apiRequest<{ authenticated: boolean; csrfToken: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
        }),
      });
      updateCsrfToken(result.csrfToken);
      setAuthenticated(true);
      setArticles(await apiRequest<NewsArticle[]>("/api/news"));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function handleCreateNews(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const article = await apiRequest<NewsArticle>("/api/news", {
        method: "POST",
        body: JSON.stringify({
          title: formData.get("title"),
          summary: formData.get("summary"),
          content: formData.get("content"),
        }),
      });
      setArticles((current) => [article, ...current]);
      setMessage("Notícia publicada com sucesso.");
      form.reset();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function handleLogout() {
    try {
      await apiRequest<void>("/api/auth/logout", { method: "POST" });
      setAuthenticated(false);
      navigate("/admin", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  if (authenticated === null) return <main className="page-main"><p>Carregando área administrativa…</p></main>;
  if (!authenticated) {
    return (
      <main className="admin-page">
        <section className="admin-panel login-panel">
          <span className="eyebrow">ACESSO RESTRITO</span>
          <h1>Área administrativa</h1>
          <p>Entre para publicar notícias no site da escola.</p>
          {error ? <p className="inline-error" role="alert">{error}</p> : null}
          <form onSubmit={handleLogin} className="form-stack">
            <label>Usuário<input name="username" autoComplete="username" required maxLength={100} /></label>
            <label>Senha<input name="password" type="password" autoComplete="current-password" required maxLength={200} /></label>
            <button className="button button-dark" type="submit">Entrar <span aria-hidden="true">→</span></button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page admin-dashboard">
      <section className="admin-panel">
        <div className="admin-heading">
          <div><span className="eyebrow">PAINEL DE PUBLICAÇÃO</span><h1>Gerenciar notícias</h1></div>
          <button className="button button-outline" onClick={handleLogout} type="button">Sair</button>
        </div>
        {error ? <p className="inline-error" role="alert">{error}</p> : null}
        {message ? <p className="success-message" role="status">{message}</p> : null}
        <form onSubmit={handleCreateNews} className="form-stack news-form">
          <label>Título<input name="title" required minLength={3} maxLength={120} /></label>
          <label>Resumo<textarea name="summary" required minLength={10} maxLength={240} rows={2} /></label>
          <label>Conteúdo<textarea name="content" required minLength={20} maxLength={20000} rows={7} /></label>
          <button className="button button-dark" type="submit">Publicar notícia <span aria-hidden="true">→</span></button>
        </form>
      </section>
      <section className="admin-articles">
        <span className="eyebrow">PUBLICADAS</span>
        <h2>Últimas notícias</h2>
        <NewsList articles={articles} />
      </section>
    </main>
  );
}

function NotFoundPage() {
  return <main className="page-main not-found"><span className="eyebrow">404</span><h1>Esta página não foi encontrada.</h1><Link className="text-link" to="/">Voltar ao início →</Link></main>;
}

function formatDate(value: string): string {
  const date = new Date(`${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.valueOf())
    ? "PUBLICADO RECENTEMENTE"
    : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Não foi possível concluir a operação.";
}

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cursos" element={<CoursesPage />} />
        <Route path="/cursos/:slug" element={<CourseDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  );
}
