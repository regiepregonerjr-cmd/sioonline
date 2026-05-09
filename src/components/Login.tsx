import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    const success = login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-200">
        {/* Header */}
        <div className="bg-gray-800 text-white px-8 py-6 rounded-t-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">SIO REPUBLIC</h1>
              <p className="text-xs text-gray-400 tracking-wider">HINUNANGAN BRANCH</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6 text-center">POS SYSTEM LOGIN</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition"
            >
              LOGIN
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Demo Credentials:</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Admin:</span>
                <span className="font-mono text-gray-800">admin / admin123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cashier:</span>
                <span className="font-mono text-gray-800">cashier1 / cashier123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-3 rounded-b-lg border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">© 2024 SIO REPUBLIC SYSTEM</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
