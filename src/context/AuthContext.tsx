import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  ratingPositive?: number;
  ratingNegative?: number;
  address?: string;
  dob?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, refreshToken: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  favorites: number[];
  toggleFavorite: (productId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);

  const fetchUserProfile = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) return;

      const response = await authService.getProfile();
      // Handle potential response wrapping (response.data or direct response)
      // Based on authService, getProfile returns response.data
      const userData = response.data || response;

      if (userData && userData.id) {
        // Update state
        setUser(userData);
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to fetch user profile on init', error);
      // If 401, potentially force logout, but for now just log
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      // Always sync profile with server to get latest role/status
      fetchUserProfile();
      
      // Fetch favorites if logged in
      fetchFavorites();
    }
    setIsLoading(false);
  }, []);

  const fetchFavorites = async () => {
      try {
          const validToken = localStorage.getItem('token');
          if (!validToken) return;
          const favs = await authService.getFavorites();
          // Assuming API returns Product[] objects, we extract IDs
          if (Array.isArray(favs)) {
             setFavorites(favs.map((p: any) => p.id));
          }
      } catch (error) {
          console.error("Failed to fetch favorites", error);
      }
  };

  useEffect(() => {
    if (token) {
        fetchFavorites();
    } else {
        setFavorites([]);
    }
  }, [token]);

  const login = (newToken: string, newRefreshToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setFavorites([]);
  };

  const toggleFavorite = async (productId: number) => {
      if (!token) return;
      
      const isCurrentlyFavorite = favorites.includes(productId);
      
      // 1. Optimistic Update
      setFavorites(prev => isCurrentlyFavorite 
          ? prev.filter(id => id !== productId) 
          : [...prev, productId]
      );

      try {
          // 2. Call API (Both methods point to the same Toggle endpoint now)
          if (isCurrentlyFavorite) {
              await authService.removeFromFavorites(productId);
          } else {
              await authService.addToFavorites(productId);
          }
      } catch (error: any) {
          console.error("Error toggling favorite", error);
          // 3. Revert if failed
          setFavorites(prev => isCurrentlyFavorite 
              ? [...prev, productId] 
              : prev.filter(id => id !== productId)
          );
          throw error;
      }
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    isLoading,
    favorites,
    toggleFavorite
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
