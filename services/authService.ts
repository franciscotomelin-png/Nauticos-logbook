
export interface User {
  email: string;
  password?: string;
  name?: string;
}

const KEYS = {
  USERS: 'nauticos_users',
  SESSION: 'nauticos_session'
};

export const authService = {
  // Get all registered users
  getUsers: (): User[] => {
    const users = localStorage.getItem(KEYS.USERS);
    return users ? JSON.parse(users) : [];
  },

  // Get current active session
  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  },

  // Register a new user
  register: (email: string, password: string): { success: boolean; message: string } => {
    const users = authService.getUsers();
    
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Este email já está cadastrado.' };
    }

    const newUser = { email, password };
    users.push(newUser);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    
    // Auto login after register
    localStorage.setItem(KEYS.SESSION, JSON.stringify({ email }));
    return { success: true, message: 'Cadastro realizado com sucesso!' };
  },

  // Login
  login: (email: string, password: string): { success: boolean; message: string } => {
    const users = authService.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem(KEYS.SESSION, JSON.stringify({ email: user.email }));
      return { success: true, message: 'Login realizado!' };
    }

    return { success: false, message: 'Email ou senha incorretos.' };
  },

  // Logout
  logout: () => {
    localStorage.removeItem(KEYS.SESSION);
  },

  // Mock Forgot Password
  resetPassword: (email: string): boolean => {
    const users = authService.getUsers();
    const user = users.find(u => u.email === email);
    return !!user;
  }
};
