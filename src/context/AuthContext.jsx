import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import { generateToken, verifyToken } from '../utils/authUtils';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        
        // Check for Supabase session first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get user data from our custom table
          const { data, error } = await supabase
            .from('users_auth_87654321')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!error && data) {
            setUser(data);
          } else {
            // Try to get basic user info from auth
            setUser({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || 'User',
              avatar_url: session.user.user_metadata?.avatar_url,
              created_at: session.user.created_at
            });
          }
        } else {
          // Check for token in localStorage as fallback
          const token = localStorage.getItem('jwt_token');
          if (token) {
            const { valid, expired, userId } = verifyToken(token);
            
            if (valid && !expired && userId) {
              // Get user data from Supabase
              const { data, error } = await supabase
                .from('users_auth_87654321')
                .select('*')
                .eq('id', userId)
                .single();
                
              if (!error && data) {
                setUser(data);
              } else {
                // User not found, remove invalid token
                localStorage.removeItem('jwt_token');
              }
            } else {
              // Token invalid or expired, remove it
              localStorage.removeItem('jwt_token');
            }
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
        setError(err.message);
        localStorage.removeItem('jwt_token');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Get user data from our custom table
          const { data, error } = await supabase
            .from('users_auth_87654321')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!error && data) {
            setUser(data);
          } else {
            // Try to get basic user info from auth
            setUser({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || 'User',
              avatar_url: session.user.user_metadata?.avatar_url,
              created_at: session.user.created_at
            });
            
            // Insert user into our users table if they don't exist
            if (event === 'SIGNED_IN') {
              await supabase.from('users_auth_87654321').insert([
                {
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.name || 'User',
                  avatar_url: session.user.user_metadata?.avatar_url,
                  created_at: new Date().toISOString()
                }
              ]).select();
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('jwt_token');
        }
      }
    );
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Register a new user
  const register = async (email, password, name) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (authError) throw authError;
      
      // Store user data in our users table
      const { data, error } = await supabase
        .from('users_auth_87654321')
        .insert([
          { 
            id: authData.user.id,
            email,
            name,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      
      if (error && error.code !== '23505') { // Ignore duplicate key violations
        console.warn("Error inserting user data:", error);
      }
      
      // For local token fallback
      const token = generateToken(authData.user.id);
      localStorage.setItem('jwt_token', token);
      
      const userData = data || {
        id: authData.user.id,
        email,
        name,
        created_at: authData.user.created_at
      };
      
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      // Get user data
      const { data, error } = await supabase
        .from('users_auth_87654321')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      // For local token fallback
      const token = generateToken(authData.user.id);
      localStorage.setItem('jwt_token', token);
      
      const userData = data || {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name || 'User',
        created_at: authData.user.created_at
      };
      
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      // Note: User will be set via the auth state change listener
      
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('jwt_token');
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};