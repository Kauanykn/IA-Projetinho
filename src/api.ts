export interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
}

export interface Discipline {
  name: string;
  description: string;
  source: string;
  isMock: boolean;
}

export interface Course {
  slug: string;
  name: string;
  description: string;
  duration: string;
  source: string;
  isMock: boolean;
  disciplines: Discipline[];
}

export interface CourseCatalog {
  courses: Course[];
  source: string;
  inventoryStatus: "pending" | "available";
}

let csrfToken = "";

export async function initializeSecurity(): Promise<void> {
  const response = await fetch("/api/auth/csrf");
  if (!response.ok) throw new Error("Não foi possível iniciar a sessão segura.");
  const data = (await response.json()) as { csrfToken: string };
  csrfToken = data.csrfToken;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (["POST", "PUT", "PATCH", "DELETE"].includes(options.method?.toUpperCase() ?? "")) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(error?.error ?? "Não foi possível concluir a solicitação.");
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function updateCsrfToken(token: string): void {
  csrfToken = token;
}
