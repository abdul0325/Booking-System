import React, { createContext, useContext, useState, useEffect } from 'react'

// More flexible API URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/users';
const TOKEN_KEY = 'busBookingToken';
const USER_KEY = 'busBookingUser';

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check for existing user session on app load
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      fetchProfile(token)
    } else {
      setLoading(false)
    }
  }, [])

  // Helper function for API calls with better error handling
  const makeApiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      // Check if the response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      // Handle network errors specifically
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check if the server is running.');
      }
      throw error;
    }
  };

  // Register user
  const signup = async (userData) => {
    setError(null)
    setLoading(true)
    try {
      const data = await makeApiCall('/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      setCurrentUser({ ...data.user, token: data.token })
      console.log(data.token,'token from signup')

      setIsAuthenticated(true)
      setError(null)
      
      // Return user data so the component can handle navigation
      return data;
    } catch (err) {
      setError(err.message)
      setIsAuthenticated(false)
      throw err; // Re-throw so the component can handle the error
    } finally {
      setLoading(false)
    }
  }

  // Login user
  const login = async (userData) => {
    setError(null)
    setLoading(true)
    try {
      const data = await makeApiCall('/login', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      if (!data) {
        setError('Login failed. Please try again.');
        setIsAuthenticated(false);
        throw new Error('Login failed. Please try again.');
      }

      console.log(data.user.role, 'user role from login');

      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      setCurrentUser({ ...data.user, token: data.token })
      console.log(data.token,'token from login')

      setIsAuthenticated(true)
      setError(null)
      
      // Return user data so the component can handle navigation
      return data;
    } catch (err) {
      setError(err.message)
      setIsAuthenticated(false)
      throw err; // Re-throw so the component can handle the error
    } finally {
      setLoading(false)
    }
  }

  // Fetch user profile (on reload)
  const fetchProfile = async (token) => {
    setLoading(true)
    setError(null)
    try {
      const data = await makeApiCall('/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setCurrentUser({ ...data, token })
      setIsAuthenticated(true)
      localStorage.setItem(USER_KEY, JSON.stringify(data))
    } catch (err) {
      setCurrentUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = () => {
    setCurrentUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setError(null)
  }
  const getAllUsers= async ()=>{
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error('Not authenticated');

      const data = await makeApiCall('/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      return await data; // Return the list of users
    } catch (err) {
      setError(err.message);
      throw err; // Re-throw so the component can handle the error
    } finally {
      setLoading(false);
    }
  }
 
  const isAdmin = () => currentUser?.role === 'admin'
  const isStationMaster = () => currentUser?.role === 'station_master'
  const isUser = () => currentUser?.role === 'user'

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    signup,
    logout,
    isAdmin,
    isStationMaster,
    isUser,
    getAllUsers
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}