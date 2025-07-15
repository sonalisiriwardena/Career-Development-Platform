import api from './index';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  role: 'jobseeker' | 'employer' | 'admin';
}

export interface UserResponse {
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    profile?: {
      title?: string;
      bio?: string;
      skills?: string[];
      experience?: Array<{
        title: string;
        company: string;
        startDate: string;
        endDate?: string;
        current: boolean;
        description: string;
      }>;
      education?: Array<{
        school: string;
        degree: string;
        field: string;
        startDate: string;
        endDate?: string;
        current: boolean;
      }>;
    };
    company?: {
      name: string;
      position: string;
      website: string;
    };
  };
  token: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  profile?: {
    bio?: string;
    skills?: string[];
    experience?: string;
    education?: string;
  };
  token: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export const login = async (credentials: LoginCredentials): Promise<UserResponse> => {
  const response = await api.post('/users/login', credentials);
  const { token, user } = response.data;
  localStorage.setItem('token', token);
  return { user, token };
};

export const register = async (data: RegisterData): Promise<UserResponse> => {
  const response = await api.post('/users/register', data);
  const { token, user } = response.data;
  localStorage.setItem('token', token);
  return { user, token };
};

export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateProfile = async (data: any) => {
  const response = await api.patch('/users/profile', data);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
}; 