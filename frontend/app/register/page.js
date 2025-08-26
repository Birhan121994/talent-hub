'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, Briefcase, Check, Upload, FileText, X } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    first_name: '',
    last_name: '',
    role: 'developer',
    phone: '',
    company: ''
  });
  const [resume, setResume] = useState(null);
  const [resumeError, setResumeError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();

  // Set role from query parameter if available
  const roleFromQuery = searchParams.get('role');
  if (roleFromQuery && !formData.role && (roleFromQuery === 'developer' || roleFromQuery === 'employer')) {
    setFormData(prev => ({ ...prev, role: roleFromQuery }));
  }

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

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    setResumeError('');
    
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setResumeError('Resume must be less than 5MB');
        return;
      }
      
      // Validate file type
      const validExtensions = ['.pdf', '.doc', '.docx'];
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(ext)) {
        setResumeError('Resume must be PDF, DOC, or DOCX format');
        return;
      }
      
      setResume(file);
    }
  };

  const removeResume = () => {
    setResume(null);
    setResumeError('');
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (formData.role === 'employer' && !formData.company) {
      newErrors.company = 'Company name is required for employers';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    setErrors({});

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '') {
        submitData.append(key, formData[key]);
      }
    });

    if (resume) {
      submitData.append('resume', resume);
    }

    const result = await register(submitData);
    
    if (result.success) {
      toast.success('Registration successful!');
      router.push('/dashboard');
    } else {
      if (result.error) {
        // Show toast for registration errors
        toast.error(typeof result.error === 'string' ? result.error : 'Registration failed');
        
        if (typeof result.error === 'object') {
          setErrors(result.error);
        } else {
          // Set general error
          setErrors({ general: result.error });
        }
      } else {
        toast.error('Registration failed. Please try again.');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      
      <div className="pt-32 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Create your account
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Join thousands of developers and companies
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between max-w-md mx-auto">
                <div className={`flex flex-col items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    {step > 1 ? <Check className="h-5 w-5" /> : '1'}
                  </div>
                  <span className="text-sm mt-1">Account</span>
                </div>
                <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                <div className={`flex flex-col items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    {step > 2 ? <Check className="h-5 w-5" /> : '2'}
                  </div>
                  <span className="text-sm mt-1">Profile</span>
                </div>
              </div>
            </div>

            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
                {errors.general}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        I am a:
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="role"
                            value="developer"
                            checked={formData.role === 'developer'}
                            onChange={handleChange}
                            className="mr-2 text-primary focus:ring-primary"
                          />
                          <div className={`px-4 py-2 rounded-lg ${formData.role === 'developer' ? 'bg-blue-100 dark:bg-blue-900/30 text-primary border border-primary' : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}>
                            <Briefcase className="h-4 w-4 inline mr-1" />
                            Developer
                          </div>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="role"
                            value="employer"
                            checked={formData.role === 'employer'}
                            onChange={handleChange}
                            className="mr-2 text-primary focus:ring-primary"
                          />
                          <div className={`px-4 py-2 rounded-lg ${formData.role === 'employer' ? 'bg-blue-100 dark:bg-blue-900/30 text-primary border border-primary' : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}>
                            <Building className="h-4 w-4 inline mr-1" />
                            Employer
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg input-focus bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Choose a username"
                      />
                    </div>
                    {errors.username && (
                      <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg input-focus bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter your email"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg input-focus bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg input-focus bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password_confirmation && (
                      <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors font-medium"
                  >
                    Continue
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg input-focus bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Your first name"
                        />
                      </div>
                      {errors.first_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg input-focus bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Your last name"
                        />
                      </div>
                      {errors.last_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg input-focus bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Your phone number"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {formData.role === 'employer' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company *
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          required={formData.role === 'employer'}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg input-focus bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Your company name"
                        />
                      </div>
                      {errors.company && (
                        <p className="text-red-500 text-sm mt-1">{errors.company}</p>
                      )}
                    </div>
                  )}

                  {formData.role === 'developer' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Resume (Optional)
                      </label>
                      {!resume ? (
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload resume</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">PDF, DOC, DOCX (Max 5MB)</p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              onChange={handleResumeChange}
                              accept=".pdf,.doc,.docx"
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                            <span className="text-sm text-green-800 dark:text-green-300">{resume.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={removeResume}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      {resumeError && (
                        <p className="text-red-500 text-sm mt-1">{resumeError}</p>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors font-medium"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-primary text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors font-medium"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Creating account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>

            <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:text-blue-700 dark:hover:text-blue-400">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;