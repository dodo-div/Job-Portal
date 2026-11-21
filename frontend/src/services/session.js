const roles = ['seeker', 'employer', 'admin'];

export function readSession() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && typeof user.token === 'string' && user.token && roles.includes(user.role) ? user : null;
  } catch {
    return null;
  }
}

export function storeSession(user) {
  if (user) localStorage.setItem('user', JSON.stringify(user));
  else localStorage.removeItem('user');
}
