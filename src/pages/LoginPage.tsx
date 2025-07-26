import React, { useState } from 'react';
import { DatabaseService } from '../backend/DatabaseService';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const dbService = new DatabaseService();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    dbService.loginUser(username.trim(), password).then((success) => {
      if (success) {
        onLoginSuccess();
      } else {
        setError('Invalid username or password.');
      }
    }).catch((error) => {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    });
  };

  const handleRegister = () => {
    dbService.registerUser(username.trim(), password).then((success) => {
      if (success) {
        onLoginSuccess();
      } else {
        setError('Username already exists.');
      }
    }).catch((error) => {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-sm w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Caregiver Login</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full mb-3 p-2 border border-gray-300 rounded"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex gap-2">
          <button
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded transition"
            onClick={handleLogin}
          >
            Login
          </button>
          <button
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded transition"
            onClick={handleRegister}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
