// src/pages/LoginPage/index.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginWithFirebase, signInWithGoogle } from '../../services/authService';
import { loginStart, loginSuccess, loginFailure } from '../../redux/reducers/authReducer';

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, loading, error } = useSelector(state => state.auth);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Kullanıcı zaten giriş yapmışsa tasks sayfasına yönlendir
    useEffect(() => {
        if (user) {
            navigate('/tasks');
        }
    }, [user, navigate]);

    // Input değişikliklerini yakala
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value.trim()
        });
    };

    // Form gönderimi
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Form validasyonu
        if (!formData.email || !formData.password) {
            dispatch(loginFailure('Lütfen tüm alanları doldurun.'));
            return;
        }

        try {
            dispatch(loginStart());
            const result = await loginWithFirebase(formData.email, formData.password);
            dispatch(loginSuccess(result));
            navigate('/tasks');
        } catch (error) {
            dispatch(loginFailure(error.message));
            setFormData(prev => ({
                ...prev,
                password: ''
            }));
        }
    };

    // Google ile giriş
    const handleGoogleLogin = async () => {
        try {
            dispatch(loginStart());
            const result = await signInWithGoogle();
            dispatch(loginSuccess(result));
            navigate('/tasks');
        } catch (error) {
            dispatch(loginFailure(error.message));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Hesabınıza giriş yapın
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Veya{' '}
                        <button
                            onClick={() => navigate('/register')}
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            yeni hesap oluşturun
                        </button>
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="rounded-md bg-red-50 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Login Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email adresi
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                placeholder="Email adresi"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        
                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Şifre
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                placeholder="Şifre"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Beni hatırla
                            </label>
                        </div>

                        <div className="text-sm">
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >Şifrenizi mi unuttunuz?
                            </button>
                        </div>
                    </div>

                    {/* Login Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                                loading 
                                    ? 'bg-blue-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Giriş yapılıyor...
                                </>
                            ) : (
                                'Giriş Yap'
                            )}
                        </button>
                    </div>
                </form>

                {/* Divider */}
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                                veya
                            </span>
                        </div>
                    </div>

                    {/* Google Login Button */}
                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                            <img
                                className="h-5 w-5 mr-2"
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                alt="Google logo"
                            />
                            Google ile devam et
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;