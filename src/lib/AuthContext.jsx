import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({
    id: 'firebase-app-id',
    public_settings: {
      name: 'Crônicas Carmesim',
      theme: 'dark'
    }
  });

  useEffect(() => {
    // Listener do Firebase para mudanças de estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth State Changed:", currentUser ? "User Logged In" : "User Logged Out", currentUser?.uid);
      setIsLoadingAuth(true);
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        // Sync user to Firestore
        base44.auth.createUser(currentUser);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);

      // Simulando carregamento de configurações públicas
      setIsLoadingPublicSettings(false);
    }, (error) => {
      console.error("Erro no Auth State Change:", error);
      setAuthError({
        type: 'auth_error',
        message: error.message
      });
      setIsLoadingAuth(false);
      setIsLoadingPublicSettings(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Mantido para compatibilidade, mas o useEffect já cuida disso
  const checkAppState = async () => {
    // No-op com Firebase listener
  };

  const logout = async (shouldRedirect = true) => {
    await base44.auth.logout(shouldRedirect ? window.location.href : null);
  };

  const navigateToLogin = () => {
    // Aqui poderíamos abrir um modal ou redirecionar
    // Por enquanto, vamos tentar logar direto com Google se chamado
    base44.auth.loginWithGoogle().catch(err => {
      console.error("Falha ao abrir login:", err);
    });
  };

  // Expor função de login explicitamente
  const loginWithGoogle = async () => {
    return base44.auth.loginWithGoogle();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      loginWithGoogle,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
