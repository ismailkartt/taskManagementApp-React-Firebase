// src/services/mfaService.js
import { 
    multiFactor,
    PhoneAuthProvider,
    PhoneMultiFactorGenerator,
    getMultiFactorResolver
} from 'firebase/auth';
import { auth } from '../firebase/config';

// MFA durumunu kontrol et
export const checkMFAStatus = async () => {
    try {
        const user = auth.currentUser;
        if (!user) return false;

        const multiFactorUser = multiFactor(user);
        const enrolledFactors = multiFactorUser.enrolledFactors;
        return enrolledFactors.length > 0;
    } catch (error) {
        console.error('MFA status check error:', error);
        return false;
    }
};

// MFA kurulumu başlat
export const startMFAEnrollment = async (phoneNumber) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

        const multiFactorUser = multiFactor(user);
        const session = await multiFactorUser.getSession();

        const phoneAuthProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneAuthProvider.verifyPhoneNumber(
            phoneNumber,
            session
        );

        return verificationId;
    } catch (error) {
        console.error('MFA enrollment error:', error);
        throw new Error('MFA kurulumu başlatılamadı: ' + error.message);
    }
};

// MFA kurulumunu tamamla
export const completeMFAEnrollment = async (verificationId, verificationCode) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

        const multiFactorUser = multiFactor(user);
        const phoneAuthCredential = PhoneAuthProvider.credential(
            verificationId,
            verificationCode
        );

        const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
        await multiFactorUser.enroll(multiFactorAssertion, "SMS");
        
        return true;
    } catch (error) {
        console.error('MFA enrollment completion error:', error);
        throw new Error('MFA kurulumu tamamlanamadı: ' + error.message);
    }
};

// MFA kaldırma
export const removeMFA = async () => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

        const multiFactorUser = multiFactor(user);
        const enrolledFactors = multiFactorUser.enrolledFactors;
        
        if (enrolledFactors.length > 0) {
            await multiFactorUser.unenroll(enrolledFactors[0]);
        }
        
        return true;
    } catch (error) {
        console.error('MFA removal error:', error);
        throw new Error('MFA kaldırılamadı: ' + error.message);
    }
};

// Login sırasında MFA doğrulama
export const handleMFALogin = async (error, verificationCode = null) => {
    try {
        if (error.code === 'auth/multi-factor-auth-required') {
            const resolver = getMultiFactorResolver(auth, error);
            
            if (!verificationCode) {
                // İlk aşama: SMS gönderme
                const phoneAuthProvider = new PhoneAuthProvider(auth);
                const verificationId = await phoneAuthProvider.verifyPhoneNumber(
                    resolver.hints[0],
                    resolver.session
                );
                return { verificationId, needsVerification: true };
            } else {
                // İkinci aşama: Kodu doğrulama
                const phoneAuthCredential = PhoneAuthProvider.credential(
                    error.verificationId,
                    verificationCode
                );
                const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
                const credential = await resolver.resolveSignIn(multiFactorAssertion);
                return { credential, needsVerification: false };
            }
        }
        throw error;
    } catch (error) {
        console.error('MFA verification error:', error);
        throw new Error('MFA doğrulaması başarısız: ' + error.message);
    }
};