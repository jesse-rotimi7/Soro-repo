'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, avatar?: File | null) => Promise<boolean>;
  updateProfile: (username?: string, email?: string) => Promise<boolean>;
  updateAvatar: (avatar: File) => Promise<boolean>;
  removeAvatar: () => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on app load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const url = `${API_BASE_URL}/auth/login`;
      console.log('Login attempt to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok && response.status !== 401) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      } else {
        console.error('Login failed:', data.message);
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError' || error.message?.includes('NetworkError')) {
        const errorMsg = `Cannot connect to server at ${API_BASE_URL}.\n\nPossible causes:\n1. Backend server is not running\n2. Server crashed or has errors\n3. CORS configuration issue\n\nPlease check:\n- Is the backend server running? (npm run server)\n- Check the server console for errors\n- Verify the server is on port 5000`;
        console.error(errorMsg);
        alert(errorMsg);
      }
      return false;
    }
  };

  const register = async (username: string, email: string, password: string, avatar?: File | null): Promise<boolean> => {
    try {
      const url = `${API_BASE_URL}/auth/register`;
      
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      if (avatar) {
        formData.append('avatar', avatar);
      }
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      }).catch((fetchError) => {
        console.error('Fetch error details:', fetchError);
        throw new Error(`Network error: ${fetchError.message}. Make sure the backend server is running on ${API_BASE_URL}`);
      });

      if (!response.ok && response.status !== 400) {
        const errorText = await response.text();
        console.error('Server response error:', response.status, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      } else {
        console.error('Registration failed:', data.message);
        return false;
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError' || error.message?.includes('Network error')) {
        const errorMsg = `Cannot connect to server at ${API_BASE_URL}.\n\nPossible causes:\n1. Backend server is not running\n2. Server crashed or has errors\n3. CORS configuration issue\n\nPlease check:\n- Is the backend server running? (npm run server)\n- Check the server console for errors\n- Verify the server is on port 5000`;
        console.error(errorMsg);
        alert(errorMsg);
      }
      return false;
    }
  };

  const updateProfile = async (username?: string, email?: string): Promise<boolean> => {
    try {
      if (!token) {
        console.error('No token available');
        return false;
      }

      const url = `${API_BASE_URL}/auth/profile`;
      const body: any = {};
      if (username) body.username = username;
      if (email) body.email = email;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Update profile failed:', data.message);
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return true;
    } catch (error: any) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  const updateAvatar = async (avatar: File): Promise<boolean> => {
    try {
      if (!token) {
        console.error('No token available');
        return false;
      }

      const url = `${API_BASE_URL}/auth/profile/avatar`;
      const formData = new FormData();
      formData.append('avatar', avatar);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Update avatar failed:', data.message);
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return true;
    } catch (error: any) {
      console.error('Update avatar error:', error);
      return false;
    }
  };

  const removeAvatar = async (): Promise<boolean> => {
    try {
      if (!token) {
        console.error('No token available');
        return false;
      }

      const url = `${API_BASE_URL}/auth/profile/avatar`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Remove avatar failed:', data.message);
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return true;
    } catch (error: any) {
      console.error('Remove avatar error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Call logout API
    if (token) {
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      }).catch(console.error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    updateProfile,
    updateAvatar,
    removeAvatar,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



