'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Mail, Lock, Github, Twitter, Facebook } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const router = useRouter();
  const { login } = useAuth();
  const { isDarkMode } = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Basic validation
    if (!formData.username || !formData.password) {
      setErrors({
        username: !formData.username ? 'Username is required' : '',
        password: !formData.password ? 'Password is required' : ''
      });
      setLoading(false);
      return;
    }

    const result = await login(formData);
    
    if (result.success) {
      toast.success('Login successful!');
      router.push('/dashboard');
    } else {
      if (result.error) {
        // Show toast for login errors
        toast.error(result.error);
        
        if (typeof result.error === 'object') {
          setErrors(result.error);
        } else {
          // Set general error
          setErrors({ general: result.error });
        }
      } else {
        toast.error('Login failed. Please try again.');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      
      <div className="pt-32 pb-32 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          <div className={`rounded-2xl shadow-2xl p-8 border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="text-center mb-8">
              <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                isDarkMode ? 'bg-blue-600' : 'bg-primary'
              }`}>
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h1 className={`text-3xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Welcome back
              </h1>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Sign in to your account to continue
              </p>
            </div>
            
            {errors.general && (
              <div className={`px-4 py-3 rounded-lg mb-6 ${
                isDarkMode 
                  ? 'bg-red-900/30 border border-red-700 text-red-400' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {errors.general}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Username or Email
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg input-focus ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter your username or email"
                  />
                </div>
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg input-focus ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className={`h-4 w-4 rounded focus:ring-2 ${
                      isDarkMode 
                        ? 'text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-700' 
                        : 'text-primary focus:ring-primary border-gray-300'
                    }`}
                  />
                  <label htmlFor="remember-me" className={`ml-2 block text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className={`font-medium hover:underline ${
                    isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-primary hover:text-blue-700'
                  }`}>
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors font-medium ${
                  isDarkMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' 
                    : 'bg-primary text-white hover:bg-blue-700 focus:ring-primary'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${
                    isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
                  }`}>
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <button className={`w-full inline-flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white' 
                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                }`}>
                  <Github className="h-5 w-5" />
                </button>

                <button className={`w-full inline-flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white' 
                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                }`}>
                  <Twitter className="h-5 w-5" />
                </button>

                <button className={`w-full inline-flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white' 
                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                }`}>
                  <Facebook className="h-5 w-5" />
                </button>
              </div>
            </div>

            <p className={`text-center mt-8 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Don't have an account?{' '}
              <Link href="/register" className={`font-medium hover:underline ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-primary hover:text-blue-700'
              }`}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;