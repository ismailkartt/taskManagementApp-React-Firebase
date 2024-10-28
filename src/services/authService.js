// src/services/authService.js
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    signOut,
    updateProfile,
    onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase/config';

const googleProvider = new GoogleAuthProvider();

// Email/Password ile kayıt
export const registerWithFirebase = async (email, password, name) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Kullanıcı profilini güncelle
        await updateProfile(userCredential.user, {
            displayName: name
        });

        return {
            user: {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: name
            },
            token: await userCredential.user.getIdToken()
        };
    } catch (error) {
        let errorMessage;
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Bu email adresi zaten kullanımda.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Geçersiz email adresi.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Email/şifre ile kayıt şu anda devre dışı.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Şifre çok zayıf. En az 6 karakter kullanın.';
                break;
            default:
                errorMessage = 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.';
        }
        throw new Error(errorMessage);
    }
};

// Email/Password ile giriş
export const loginWithFirebase = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return {
            user: {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName,
            },
            token: await userCredential.user.getIdToken()
        };
    } catch (error) {
        let errorMessage;
        switch (error.code) {
            case 'auth/invalid-credential':
                errorMessage = 'Email veya şifre hatalı.';
                break;
            case 'auth/user-not-found':
                errorMessage = 'Bu email adresiyle kayıtlı kullanıcı bulunamadı.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Şifre hatalı.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Geçersiz email adresi.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'Bu hesap devre dışı bırakılmış.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
                break;
            default:
                errorMessage = 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.';
        }
        throw new Error(errorMessage);
    }
};

// Google ile giriş
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return {
            user: {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL
            },
            token: await result.user.getIdToken()
        };
    } catch (error) {
        let errorMessage = 'Google ile giriş yapılırken bir hata oluştu.';
        switch (error.code) {
            case 'auth/popup-closed-by-user':
                errorMessage = 'Google giriş penceresi kapatıldı.';
                break;
            case 'auth/popup-blocked':
                errorMessage = 'Pop-up penceresi engellendi. Pop-up engelleyiciyi devre dışı bırakın.';
                break;
            case 'auth/cancelled-popup-request':
                errorMessage = 'Önceki oturum açma isteği devam ediyor.';
                break;
            default:
                errorMessage = 'Google ile giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.';
        }
        throw new Error(errorMessage);
    }
};

// Çıkış yapma
export const logoutFromFirebase = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw new Error('Çıkış yapılırken bir hata oluştu.');
    }
};

// Şifre sıfırlama
export const sendPasswordReset = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return 'Şifre sıfırlama bağlantısı email adresinize gönderildi.';
    } catch (error) {
        let errorMessage;
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'Geçersiz email adresi.';
                break;
            case 'auth/user-not-found':
                errorMessage = 'Bu email adresiyle kayıtlı kullanıcı bulunamadı.';
                break;
            default:
                errorMessage = 'Şifre sıfırlama işlemi başarısız oldu. Lütfen tekrar deneyin.';
        }
        throw new Error(errorMessage);
    }
};

// Auth state değişikliklerini dinleme
export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            const token = await user.getIdToken();
            callback({
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                },
                token
            });
        } else {
            callback(null);
        }
    });
};

// Firebase hata mesajlarını Türkçeleştirme
export const getFirebaseErrorMessage = (error) => {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'Bu email adresi zaten kullanımda.';
        case 'auth/invalid-email':
            return 'Geçersiz email adresi.';
        case 'auth/operation-not-allowed':
            return 'Bu işlem şu anda kullanılamıyor.';
        case 'auth/weak-password':
            return 'Şifre çok zayıf. En az 6 karakter kullanın.';
        case 'auth/user-disabled':
            return 'Bu hesap devre dışı bırakılmış.';
        case 'auth/user-not-found':
            return 'Kullanıcı bulunamadı.';
        case 'auth/wrong-password':
            return 'Hatalı şifre.';
        case 'auth/invalid-credential':
            return 'Geçersiz giriş bilgileri.';
        case 'auth/too-many-requests':
            return 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.';
        default:
            return 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
};