const baseUrl = import.meta.env.VITE_API_URL;

export const login = async (username, password) => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Login failed');
  return data;
};

// Noua funcție de înregistrare
export const register = async (username, password, role) => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Registration failed');
  return data;
};
