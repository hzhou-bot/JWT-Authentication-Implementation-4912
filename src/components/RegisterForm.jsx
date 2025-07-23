import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import SafeIcon from '../common/SafeIcon';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setGoogleLoading(true);
    
    try {
      await loginWithGoogle();
      // Note: The redirect will happen automatically after OAuth flow
    } catch (err) {
      setError(err.message || 'Failed to register with Google. Please ensure Google OAuth is configured in Supabase.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Create an Account</h2>
      
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
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-4 py-2 outline-none"
              placeholder="Full name"
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center border rounded-lg overflow-hidden shadow-sm">
            <div className="px-3 py-2 bg-gray-50">
              <SafeIcon icon={FiMail} className="text-gray-400" />
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
        
        <div className="mb-6">
          <div className="flex items-center border rounded-lg overflow-hidden shadow-sm">
            <div className="px-3 py-2 bg-gray-50">
              <SafeIcon icon={FiLock} className="text-gray-400" />
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex-1 px-4 py-2 outline-none"
              placeholder="Confirm password"
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
            <SafeIcon icon={FiUserPlus} className="mr-2" />
          )}
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="px-3 text-sm text-gray-500">OR</div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
      
      <button
        onClick={handleGoogleRegister}
        disabled={googleLoading}
        className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition duration-200 shadow-sm"
      >
        {googleLoading ? (
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
        ) : (
          <FcGoogle className="mr-3 text-xl" />
        )}
        {googleLoading ? 'Connecting with Google...' : 'Sign up with Google'}
      </button>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;