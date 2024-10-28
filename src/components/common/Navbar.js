// src/components/common/Navbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/reducers/authReducer';

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector(state => state.auth);
    
    // Email'den kullanıcı adını al
    const username = user?.email ? user.email.split('@')[0] : '';

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser());
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Left side - Logo and navigation */}
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <button
                                onClick={() => navigate('/')}
                                className="text-xl font-bold text-gray-900 dark:text-white"
                            >
                                Task Manager
                            </button>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <button
                                onClick={() => navigate('/')}
                                className="text-gray-900 dark:text-white hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Ana Sayfa
                            </button>
                            {isAuthenticated && (
                                <button
                                    onClick={() => navigate('/tasks')}
                                    className="text-gray-900 dark:text-white hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Görevlerim
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right side - User menu or auth buttons */}
                    <div className="flex items-center">
                        {isAuthenticated ? (
                            <div className="relative group">
                                <button className="flex items-center space-x-2 text-gray-900 dark:text-white hover:text-gray-500 focus:outline-none">
                                    <span>{username}</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {/* Dropdown Menu */}
                                <div className="absolute right-0 w-48 mt-2 py-2 bg-white dark:bg-gray-800 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                    >
                                        Profil Ayarları
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                    >
                                        Çıkış Yap
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-gray-900 dark:text-white hover:text-gray-500 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Giriş Yap
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Kayıt Ol
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;