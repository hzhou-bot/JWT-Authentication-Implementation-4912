import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import SafeIcon from '../common/SafeIcon';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page the user was trying to visit before being redirected to login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    
    try {
      await loginWithGoogle();
      // Redirect happens automatically after OAuth
    } catch (err) {
      setError(err.message || 'Failed to login with Google.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Login to Your Account</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="flex items-center border rounded-lg overflow-hidden shadow-sm">
            <div className="px-3 py-2 bg-gray-50">
              <SafeIcon icon={FiUser} className="text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2 outline-none"
              placeholder="Email address"
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center border rounded-lg overflow-hidden shadow-sm">
            <div className="px-3 py-2 bg-gray-50">
              <SafeIcon icon={FiLock} className="text-gray-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 px-4 py-2 outline-none"
              placeholder="Password"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition duration-200"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : (
            <SafeIcon icon={FiLogIn} className="mr-2" />
          )}
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="px-3 text-sm text-gray-500">OR</div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
      
      <button
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition duration-200"
      >
        {googleLoading ? (
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
        ) : (
          <FcGoogle className="mr-2 text-xl" />
        )}
        {googleLoading ? 'Connecting...' : 'Continue with Google'}
      </button>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;