
// src/components/auth/LoginPage.jsx
import React, { useState } from 'react';
import { FileText, Mail, Key, AlertTriangle, RefreshCw, Eye, EyeOff, X } from 'lucide-react';

const MOCK_USERS = {
  'faisal@acme.com': { password: 'faisal123', name: 'Faisal Suleman', role: 'Admin', avatar: 'FS' },
  'admin@acme.com': { password: 'admin123', name: 'Admin User', role: 'Admin', avatar: 'AU' },
  'manager@acme.com': { password: 'manager123', name: 'Manager User', role: 'Manager', avatar: 'MU' },
  'analyst@acme.com': { password: 'analyst123', name: 'Analyst User', role: 'Analyst', avatar: 'AN' },
};

export default function LoginPage({ onLogin, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin(email, password);
      setIsLoading(false);
    }, 800);
  };

  const demoLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsLoading(true);
    setTimeout(() => onLogin(demoEmail, demoPass), 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">FABBYY FLEXICAPTURE</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {showDemo && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                  Demo Accounts
                </h3>
                <button onClick={() => setShowDemo(false)} className="text-blue-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                {Object.entries(MOCK_USERS).map(([email, user]) => (
                  <div key={email} className="flex justify-between items-center">
                    <span className="text-blue-700">
                      <strong>{user.name.split(' ')[0]}:</strong> {email} / {user.password}
                    </span>
                    <button
                      onClick={() => demoLogin(email, user.password)}
                      className="text-blue-600 font-medium text-sm"
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Key className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              {isLoading ? <>Signing in...</> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
