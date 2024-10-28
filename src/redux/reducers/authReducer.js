// src/redux/reducers/authReducer.js
import { createSlice } from "@reduxjs/toolkit";
import { 
    loginWithFirebase, 
    registerWithFirebase, 
    logoutFromFirebase,
    signInWithGoogle,
    sendPasswordReset,
    getFirebaseErrorMessage 
} from "../../services/authService";
import { auth } from "../../firebase/config"; 

// Local storage'dan token'ı al
const token = localStorage.getItem('token');

const initialState = {
    user: null,
    token: token,
    loading: false,
    error: null,
    isAuthenticated: !!token, // Token varsa authenticated true olsun
    passwordResetMessage: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Login actions
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.error = null;
            localStorage.setItem('token', action.payload.token);
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
        },

        // Register actions
        registerStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        registerSuccess: (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.error = null;
            localStorage.setItem('token', action.payload.token);
        },
        registerFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
        },

        // Logout action
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            state.passwordResetMessage = null;
            localStorage.removeItem('token');
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },

        // Password reset actions
        passwordResetStart: (state) => {
            state.loading = true;
            state.error = null;
            state.passwordResetMessage = null;
        },
        passwordResetSuccess: (state, action) => {
            state.loading = false;
            state.passwordResetMessage = action.payload;
            state.error = null;
        },
        passwordResetFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.passwordResetMessage = null;
        },
        clearPasswordResetMessage: (state) => {
            state.passwordResetMessage = null;
        }
    }
});

// Export actions
export const {
    loginStart,
    loginSuccess,
    loginFailure,
    registerStart,
    registerSuccess,
    registerFailure,
    logout,
    clearError,
    passwordResetStart,
    passwordResetSuccess,
    passwordResetFailure,
    clearPasswordResetMessage
} = authSlice.actions;

// Async Thunk Actions
export const loginUser = (credentials) => async (dispatch) => {
    try {
        dispatch(loginStart());
        const result = await loginWithFirebase(credentials.email, credentials.password);
        dispatch(loginSuccess(result));
        return result;
    } catch (error) {
        const errorMessage = getFirebaseErrorMessage(error);
        dispatch(loginFailure(errorMessage));
        throw error;
    }
};

export const registerUser = (userData) => async (dispatch) => {
    try {
        dispatch(registerStart());
        const result = await registerWithFirebase(
            userData.email, 
            userData.password, 
            userData.name
        );
        dispatch(registerSuccess(result));
        return result;
    } catch (error) {
        const errorMessage = getFirebaseErrorMessage(error);
        dispatch(registerFailure(errorMessage));
        throw error;
    }
};

export const logoutUser = () => async (dispatch) => {
    try {
        await logoutFromFirebase();
        dispatch(logout());
    } catch (error) {
        const errorMessage = getFirebaseErrorMessage(error);
        console.error('Logout error:', errorMessage);
    }
};

export const googleLogin = () => async (dispatch) => {
    try {
        dispatch(loginStart());
        const result = await signInWithGoogle();
        dispatch(loginSuccess(result));
        return result;
    } catch (error) {
        const errorMessage = getFirebaseErrorMessage(error);
        dispatch(loginFailure(errorMessage));
        throw error;
    }
};

export const resetPassword = (email) => async (dispatch) => {
    try {
        dispatch(passwordResetStart());
        const message = await sendPasswordReset(email);
        dispatch(passwordResetSuccess(message));
        return message;
    } catch (error) {
        const errorMessage = getFirebaseErrorMessage(error);
        dispatch(passwordResetFailure(errorMessage));
        throw error;
    }
};

// Initialize auth state listener
export const initAuth = () => (dispatch) => {
    // Firebase auth state değişikliklerini dinle
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
            const token = await user.getIdToken();
            dispatch(loginSuccess({
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                },
                token
            }));
        } else {
            dispatch(logout());
        }
    });

    // Cleanup
    return unsubscribe;
};

export default authSlice.reducer;