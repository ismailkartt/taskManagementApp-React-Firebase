// src/pages/ProfilePage/index.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import MFASetup from '../../components/auth/MFASetup';

const ProfilePage = () => {
    const [showMFASetup, setShowMFASetup] = useState(false);
    const { user } = useSelector(state => state.auth);
    const username = user?.email ? user.email.split('@')[0] : '';

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Profil Ayarları
                </h1>

                {/* Kullanıcı Bilgileri */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Hesap Bilgileri
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Kullanıcı Adı
                            </label>
                            <p className="mt-1 text-gray-900 dark:text-white">
                                {username}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                E-posta
                            </label>
                            <p className="mt-1 text-gray-900 dark:text-white">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Güvenlik Ayarları */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Güvenlik Ayarları
                    </h2>
                    
                    {/* MFA Durumu ve Buton */}
                    <div className="flex items-center justify-between py-4 border-b dark:border-gray-700">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                İki Faktörlü Kimlik Doğrulama
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                SMS ile ek güvenlik katmanı ekleyin
                            </p>
                        </div>
                        <button
                            onClick={() => setShowMFASetup(true)}
                            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Aktifleştir
                        </button>
                    </div>
                </div>

                {/* MFA Setup Modal */}
                {showMFASetup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="w-full max-w-md">
                            <MFASetup 
                                onClose={() => setShowMFASetup(false)}
                                onSuccess={() => {
                                    setShowMFASetup(false);
                                    // Başarılı kurulum sonrası işlemler
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;