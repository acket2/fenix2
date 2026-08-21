import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { updateUserPassword } from '../utils/storage';
import { 
  Shield, 
  LayoutDashboard, 
  Wallet, 
  PackageSearch, 
  HardHat, 
  CheckSquare, 
  CalendarDays, 
  Files,
  LogOut,
  Users,
  Menu,
  X,
  Eye,
  EyeOff,
  Settings,
  Key
} from 'lucide-react';
import MainView from './views/MainView';
import AdminView from './views/AdminView';
import ObjectsView from './views/ObjectsView';
import FotView from './views/FotView';
import TasksView from './views/TasksView';
import ObjectDetailsView from './views/ObjectDetailsView';
import WarehouseView from './views/WarehouseView';
import PlansView from './views/PlansView';
import DocsView from './views/DocsView';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
}

type TabKey = 'main' | 'fot' | 'warehouse' | 'objects' | 'tasks' | 'plans' | 'docs' | 'admin';

export default function DashboardLayout({ user, onLogout }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(user.role === 'user' ? 'warehouse' : 'main');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPassword || !confirmPassword) {
      setPasswordError('Заполните все поля');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    try {
      await updateUserPassword(user.id, newPassword);
      setPasswordSuccess('Пароль успешно изменен. Выполняется выход...');
      
      setTimeout(() => {
        setIsChangingPassword(false);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccess('');
        onLogout(); // Выкидываем пользователя на страницу входа
      }, 1500);
    } catch (err) {
      setPasswordError('Ошибка при изменении пароля');
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  let tabs = [
    { id: 'main', label: 'Панель управления', icon: LayoutDashboard },
    { id: 'objects', label: 'Проекты и Объекты', icon: HardHat },
    { id: 'fot', label: 'Финансы (ФОТ)', icon: Wallet },
    { id: 'warehouse', label: 'Склад', icon: PackageSearch },
    { id: 'plans', label: 'Планирование', icon: CalendarDays },
    { id: 'tasks', label: 'Задачи', icon: CheckSquare },
    { id: 'docs', label: 'Документы', icon: Files },
  ];

  if (user.role === 'user') {
    tabs = tabs.filter(tab => ['main', 'warehouse', 'plans', 'tasks', 'docs'].includes(tab.id));
  }

  if (user.role === 'admin') {
    tabs.push({ id: 'admin', label: 'Управление доступом', icon: Users });
  }

  const renderContent = () => {
    if (selectedObjectId) {
      return <ObjectDetailsView user={user} objectId={selectedObjectId} onBack={() => setSelectedObjectId(null)} />;
    }

    switch (activeTab) {
      case 'main': return <MainView user={user} onNavigateToProject={(id) => setSelectedObjectId(id)} />;
      case 'objects': return <ObjectsView user={user} onNavigateToProject={(id) => setSelectedObjectId(id)} />;
      case 'fot': return <FotView user={user} />;
      case 'tasks': return <TasksView user={user} />;
      case 'admin': return <AdminView />;
      case 'warehouse': return <WarehouseView user={user} />;
      case 'plans': return <PlansView user={user} />;
      case 'docs': return <DocsView user={user} />;
      default:
        return <div className="text-white p-4">Раздел пуст</div>;
    }
  };

  const handleTabClick = (id: string) => {
    setActiveTab(id as TabKey);
    setSelectedObjectId(null);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-sans">
      
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'relative'} 
          ${sidebarOpen ? 'w-72 translate-x-0' : (isMobile ? '-translate-x-full w-72' : 'w-20 translate-x-0')}
          bg-slate-800/95 border-r border-slate-700/50 transition-all duration-300 flex flex-col shadow-2xl
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Shield className="text-white w-6 h-6" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-white text-lg tracking-tight">СТРОЙКА</span>
                <span className="text-cyan-400 text-[10px] uppercase tracking-widest font-medium">Pro System</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto space-y-1 px-3 custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-white shadow-lg shadow-blue-900/20 border border-blue-500/20' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                {sidebarOpen && (
                  <span className={`text-sm font-medium truncate ${isActive ? 'text-white' : ''}`}>
                    {tab.label}
                  </span>
                )}
                {isActive && sidebarOpen && (
                  <div className="ml-auto w-1.5 h-5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-slate-700/50 space-y-2 bg-slate-900/20">
          {!isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors border border-slate-700"
            >
              <Menu size={18} />
              {sidebarOpen && 'Свернуть меню'}
            </button>
          )}

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm transition-colors border border-red-500/20 group"
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            {sidebarOpen && 'Выйти из системы'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="bg-slate-800/50 border-b border-slate-700/50 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight hidden sm:block truncate max-w-[150px] sm:max-w-none">
              {tabs.find(t => t.id === activeTab)?.label || 'Раздел'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                {new Date().toLocaleDateString('ru-RU', { weekday: 'long' })}
              </div>
              <div className="text-sm font-bold text-cyan-400">
                {new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            
            <div className="h-10 w-px bg-slate-700/50 hidden md:block"></div>

            <button
              onClick={() => setIsChangingPassword(true)}
              className="p-2 bg-slate-700/30 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-600/30 transition-colors"
              title="Изменить пароль"
            >
              <Key className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 bg-slate-700/30 px-3 py-1.5 rounded-full border border-slate-600/30">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-white text-sm font-bold leading-tight">{user.login}</span>
                <span className="text-cyan-400 text-[10px] uppercase tracking-wider font-bold">{user.role}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                {user.login.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-3 sm:p-6 md:p-8 w-full max-w-[100vw]">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Модальное окно изменения пароля */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Изменить пароль</h3>
              <button 
                onClick={() => {
                  setIsChangingPassword(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                  setPasswordSuccess('');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm">
                  {passwordSuccess}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Новый пароль</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder="Введите новый пароль"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Подтвердите пароль</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder="Повторите новый пароль"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
