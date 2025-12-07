// src/App.jsx
import React, { useState } from 'react';
import LoginPage from './components/auth/LoginPage';
import InvoiceDashboard from './InvoiceDashboard';
const MOCK_USERS = {
 'faisal@acme.com': { password: 'faisal123', name: 'Faisal Suleman', email: 'faisal@acme.com', role: 'Admin', avatar: 'FS' },
 'admin@acme.com': { password: 'admin123', name: 'Admin User', email: 'admin@acme.com', role: 'Admin', avatar: 'AU' },
 'manager@acme.com': { password: 'manager123', name: 'Manager User', email: 'manager@acme.com', role: 'Manager', avatar: 'MU' },
 'analyst@acme.com': { password: 'analyst123', name: 'Analyst User', email: 'analyst@acme.com', role: 'Analyst', avatar: 'AN' },
};
function App() {
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 const [currentUser, setCurrentUser] = useState(null);
 const [loginError, setLoginError] = useState('');
 const handleLogin = (email, password) => {
   const normalizedEmail = email.toLowerCase().trim();
   const user = MOCK_USERS[normalizedEmail];
   if (!user || user.password !== password) {
     setLoginError('Invalid email or password');
     return;
   }
   setCurrentUser(user);
   setIsAuthenticated(true);
   setLoginError('');
 };
 const handleLogout = () => {
   setIsAuthenticated(false);
   setCurrentUser(null);
 };
 return (
<>
     {!isAuthenticated ? (
<LoginPage onLogin={handleLogin} error={loginError} />
     ) : (
<InvoiceDashboard currentUser={currentUser} onLogout={handleLogout} />
     )}
</>
 );
}
export default App;