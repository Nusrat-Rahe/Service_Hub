export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
};

type AuthResponse = {
  message?: string;
  user?: AuthUser;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function readResponse(response: Response): Promise<AuthResponse> {
  const result = (await response.json().catch(() => null)) as
    | AuthResponse
    | null;
  if (!response.ok) {
    throw new Error(result?.message ?? "The request could not be completed.");
  }
  return result ?? {};
}

async function postAuth(
  endpoint: string,
  body?: Record<string, string>,
): Promise<AuthResponse> {
  const response = await fetch(`${apiUrl}/api/auth/${endpoint}`, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  return readResponse(response);
}

export function registerUser(
  fullName: string,
  email: string,
  password: string,
) {
  return postAuth("register", { fullName, email, password });
}

export function loginUser(email: string, password: string) {
  return postAuth("login", { email, password });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch(`${apiUrl}/api/auth/me`, {
    credentials: "include",
  });
  if (response.status === 401) return null;
  const result = await readResponse(response);
  return result.user ?? null;
}

export function logoutUser() {
  return postAuth("logout");
}
