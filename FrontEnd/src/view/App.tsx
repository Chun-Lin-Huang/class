import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';
import AppRouter from '../router/router';
import '../style/App.css';

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>課堂點名系統</h1>
        <div className="user-info">
          <span className="welcome-text" style={{ color: 'white' }}>歡迎，{user.studentInfo?.name || user.userName}</span>
          <button 
            onClick={logout}
            className="logout-btn"
          >
            登出
          </button>
        </div>
      </header>
      
      <main className="app-main">
        <AppRouter />
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
