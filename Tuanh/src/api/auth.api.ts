import http from "./http";

export const login = (email: string, password: string) =>
  http.post("/auth/login", { email, password });

export const register = (name: string, email: string, password: string) =>
  http.post("/auth/register", { name, email, password });

export const forgotPassword = (email: string) =>
  http.post("/auth/forgot-password", { email });
