import React, { useState } from 'react';
import { getStorageUsers, addRegistrationRequest } from '../utils/storage';
import { User } from '../types';
import { Building2, Lock, User as UserIcon, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!login || !password) {
      setError('Заполните все поля');
      return;
    }

    if (isLoginView) {
      const users = getStorageUsers();
      const user = users.find(u => u.login === login && u.password === password);
      
      if (user) {
        setSuccessMsg('Вход успешный! Перенаправление...');
        setTimeout(() => {
          onLogin(user);
        }, 800);
      } else {
        setError('Неверный логин или пароль');
      }
    } else {
      // Registration request
      addRegistrationRequest({ login, password });
      setSuccessMsg('Заявка отправлена. Ожидайте подтверждения администратором.');
      setLogin('');
      setPassword('');
      setIsLoginView(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 font-sans text-slate-200 relative overflow-hidden">
      {/* Фоновые декорации */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/50 shadow-2xl p-8">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Building2 className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">СТРОЙКА</h1>
            <p className="text-slate-400 text-sm">
              {isLoginView ? 'Добро пожаловать в систему' : 'Подать заявку на регистрацию'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
                <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            )}
            
            {successMsg && (
              <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3">
                <CheckCircle className="text-green-400 flex-shrink-0" size={20} />
                <p className="text-green-300 text-sm font-medium">{successMsg}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Имя пользователя (Логин)
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Введите логин..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль..."
                  className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl mt-4"
            >
              {isLoginView ? 'Войти в систему' : 'Отправить заявку'}
            </button>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-slate-700/50">
            <p className="text-slate-400 text-sm">
              {isLoginView ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
              {' '}
              <button
                onClick={() => {
                  setIsLoginView(!isLoginView);
                  setError('');
                  setSuccessMsg('');
                }}
                className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
              >
                {isLoginView ? 'Подать заявку' : 'Войти'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
