"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Menu, X, Briefcase, User, LogOut } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-primary dark:text-blue-400 font-bold text-xl">
              <Briefcase className="h-6 w-6 mr-2" />
              TalentHub
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/jobs" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 px-3 py-2 rounded-md">
              Jobs
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'employer' && (
                  <Link href="/post-job" className="bg-primary dark:bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-700">
                    Post Job
                  </Link>
                )}
                <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 px-3 py-2 rounded-md">
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{user.username}</span>
                </div>
                <DarkModeToggle />
                <button
                  onClick={handleLogout}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 px-3 py-2 rounded-md flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <DarkModeToggle />
                <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 px-3 py-2 rounded-md">
                  Login
                </Link>
                <Link href="/register" className="bg-primary dark:bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-700">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <DarkModeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <Link 
                href="/jobs" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 block px-3 py-2 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Jobs
              </Link>
              
              {user ? (
                <>
                  {user.role === 'employer' && (
                    <Link 
                      href="/post-job" 
                      className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 block px-3 py-2 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Post Job
                    </Link>
                  )}
                  <Link 
                    href="/dashboard" 
                    className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 block px-3 py-2 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="px-3 py-2 text-gray-700 dark:text-gray-300 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    {user.username}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 w-full text-left px-3 py-2 rounded-md flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 block px-3 py-2 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 block px-3 py-2 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;