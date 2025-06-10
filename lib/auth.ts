
interface User {
  id: string;
  email: string;
  name: string;
  apiKey: string | null;
}

interface UserWithPassword extends User {
  password: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
}

const users = new Map<string, UserWithPassword>();

export const mockAuth = {
  currentUser: {} as User,

  async register({ email, password, name }: RegisterCredentials): Promise<User> {
    if (users.has(email)) {
      throw new Error('User already exists');
    }

    const user: User = {
      id: Math.random().toString(36).slice(2),
      email,
      name,
      apiKey: null
    };

    users.set(email, { ...user, password });
    this.currentUser = user;

    localStorage.setItem('itinerary:user', JSON.stringify(user));

    window.location.href = '/dashboard';

    return user;
  },

  async login({ email, password }: LoginCredentials): Promise<User> {
    const user = users.get(email);

    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    this.currentUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      apiKey: user.apiKey
    };

    localStorage.setItem('itinerary:user', JSON.stringify(this.currentUser));

    window.location.href = '/dashboard';

    return this.currentUser;
  },

  async generateApiKey(): Promise<string> {
    this.loadUserFromStorage();

    if (!this.currentUser?.email) {
      throw new Error('Not authenticated');
    }

    const apiKey = 'key_' + Math.random().toString(36).slice(2);

    const storedUser = users.get(this.currentUser.email);
    if (storedUser) {
      storedUser.apiKey = apiKey;
      users.set(this.currentUser.email, storedUser);
    } else {
      users.set(this.currentUser.email, {
        ...this.currentUser,
        password: 'recovered', // Placeholder password since we don't store it in localStorage
        apiKey
      });
    }

    this.currentUser.apiKey = apiKey;

    localStorage.setItem('itinerary:user', JSON.stringify(this.currentUser));

    return apiKey;
  },

  loadUserFromStorage(): void {
    const userData = localStorage.getItem('itinerary:user');
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData) as User;
      } catch (error) {
        this.currentUser = {} as User;
      }
    }
  },

  checkAuth(): boolean {
    this.loadUserFromStorage();

    if (this.currentUser?.email) {
      if (!window.location.pathname.includes('/dashboard')) {
        window.location.href = '/dashboard';
      }
      return true;
    }

    return false;
  },

  logout(): void {
    this.currentUser = {} as User;
    localStorage.removeItem('itinerary:user');
    window.location.href = '/login';
  }
};

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    mockAuth.checkAuth();
  });
}