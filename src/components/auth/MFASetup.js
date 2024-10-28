// src/components/auth/MFASetup.js
import React, { useState, useEffect } from 'react';
import { 
    startMFAEnrollment, 
    completeMFAEnrollment, 
    checkMFAStatus,
    removeMFA 
} from '../../services/mfaService';

const MFASetup = ({ onClose }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [step, setStep] = useState(1); // 1: phone, 2: code
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isMFAEnabled, setIsMFAEnabled] = useState(false);

    // MFA durumunu kontrol et
    useEffect(() => {
        const checkStatus = async () => {
            const status = await checkMFAStatus();
            setIsMFAEnabled(status);
        };
        checkStatus();
    }, []);

    // MFA'yı kaldır
    const handleRemoveMFA = async () => {
        if (!window.confirm('İki faktörlü kimlik doğrulamayı kaldırmak istediğinizden emin misiniz?')) {
            return;
        }

        setLoading(true);
        try {
            await removeMFA();
            setIsMFAEnabled(false);
            alert('İki faktörlü kimlik doğrulama başarıyla kaldırıldı.');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Telefon numarası gönderme
    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const verificationId = await startMFAEnrollment(phoneNumber);
            setVerificationId(verificationId);
            setStep(2);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Doğrulama kodunu tamamlama
    const handleVerificationSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await completeMFAEnrollment(verificationId, verificationCode);
            setIsMFAEnabled(true);
            alert('İki faktörlü kimlik doğrulama başarıyla etkinleştirildi!');
            onClose();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    İki Faktörlü Kimlik Doğrulama
                </h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                    {error}
                </div>
            )}

            {isMFAEnabled ? (
                <div>
                    <p className="text-green-600 dark:text-green-400 mb-4">
                        İki faktörlü kimlik doğrulama aktif.
                    </p>
                    <button
                        onClick={handleRemoveMFA}
                        disabled={loading}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Kaldırılıyor...' : 'MFA\'yı Kaldır'}
                    </button>
                </div>
            ) : step === 1 ? (
                <form onSubmit={handlePhoneSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                            Telefon Numarası
                        </label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+90 5XX XXX XX XX"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerificationSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                            Doğrulama Kodu
                        </label>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="6 haneli kod"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            Geri
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? 'Doğrulanıyor...' : 'Kurulumu Tamamla'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default MFASetup;