// Arquivo central para configurar a API no Vite
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  return fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });
}
