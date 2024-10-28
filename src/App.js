// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { useSelector, useDispatch } from 'react-redux';
import store from './redux/store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { loginSuccess, logout } from './redux/reducers/authReducer';

// Components
import Navbar from './components/common/Navbar';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import TaskPage from './pages/TaskPage';
import ProfilePage from './pages/ProfilePage';

// AuthStateWrapper component to handle auth state
const AuthStateWrapper = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Kullanıcı giriş yapmış
        const token = await user.getIdToken();
        dispatch(loginSuccess({
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          },
          token
        }));
      } else {
        // Kullanıcı çıkış yapmış
        dispatch(logout());
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [dispatch]);

  return children;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthStateWrapper>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route 
                  path="/login" 
                  element={
                    <LoginPage />
                  }
                />
                <Route 
                  path="/register" 
                  element={
                    <RegisterPage />
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute>
                      <TaskPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </AuthStateWrapper>
      </Router>
    </Provider>
  );
}

export default App;