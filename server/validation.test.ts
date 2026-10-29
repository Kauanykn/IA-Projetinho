import { describe, expect, it } from "vitest";
import { loginSchema, newsSchema } from "./validation.js";

describe("loginSchema", () => {
  it("trims the username and accepts a non-empty password", () => {
    expect(loginSchema.parse({ username: " admin ", password: "example" })).toEqual({
      username: "admin",
      password: "example",
    });
  });

  it("rejects empty credentials and oversized values", () => {
    expect(loginSchema.safeParse({ username: " ", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ username: "a".repeat(101), password: "x" }).success).toBe(false);
  });
});

describe("newsSchema", () => {
  const validArticle = {
    title: "Feira de projetos",
    summary: "Alunos apresentam projetos desenvolvidos ao longo do semestre.",
    content: "A comunidade escolar está convidada para conhecer os projetos dos estudantes.",
  };

  it("trims valid article fields", () => {
    expect(newsSchema.parse({ ...validArticle, title: "  Feira de projetos  " }).title).toBe(
      "Feira de projetos",
    );
  });

  it("rejects missing, short, or oversized article fields", () => {
    expect(newsSchema.safeParse({ ...validArticle, summary: "curto" }).success).toBe(false);
    expect(newsSchema.safeParse({ ...validArticle, title: "x".repeat(121) }).success).toBe(false);
  });
});
