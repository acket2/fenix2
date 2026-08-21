import React, { useState, useEffect } from 'react';
import { User, PlanTask } from '../../types';
import { getPlans, updatePlan, deletePlan } from '../../utils/storage';
import { CalendarDays, Check, Trash2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PlansViewProps {
  user: User;
}

export default function PlansView({ user }: PlansViewProps) {
  const [plans, setPlans] = useState<PlanTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const loadData = () => {
    setPlans(getPlans());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('app-storage-changed', loadData);
    return () => window.removeEventListener('app-storage-changed', loadData);
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || user.role === 'user') return;
    
    const newTask: PlanTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      isCompleted: false
    };
    
    await updatePlan(newTask);
    setNewTaskTitle('');
  };

  const toggleTask = async (task: PlanTask) => {
    if (user.role === 'user') return;
    await updatePlan({ ...task, isCompleted: !task.isCompleted });
  };

  const handleDeleteTask = async (id: string) => {
    if (user.role === 'user') return;
    if (confirm('Удалить этот пункт плана?')) {
      await deletePlan(id);
    }
  };

  const pendingTasks = plans.filter(t => !t.isCompleted);
  const completedTasks = plans.filter(t => t.isCompleted);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <CalendarDays className="w-8 h-8 text-cyan-400" /> 
          Планирование
        </h2>
        <div className="flex items-center gap-4 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <span className="text-white font-medium">{pendingTasks.length}</span>
            <span className="text-slate-400 text-sm hidden sm:inline">в планах</span>
          </div>
          <div className="w-px h-4 bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-medium">{completedTasks.length}</span>
            <span className="text-slate-400 text-sm hidden sm:inline">завершено</span>
          </div>
        </div>
      </div>

      {user.role !== 'user' && (
        <form onSubmit={handleAddTask} className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-2 flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Новый пункт плана..."
            className="flex-1 bg-transparent border-none text-white px-4 focus:outline-none placeholder:text-slate-500"
          />
          <button 
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus className="w-5 h-5" /> 
            <span>Добавить</span>
          </button>
        </form>
      )}

      <div className="space-y-4">
        {pendingTasks.map(task => (
          <div 
            key={task.id} 
            className="group flex items-center gap-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl p-4 transition-all"
          >
            <button
              onClick={() => toggleTask(task)}
              disabled={user.role === 'user'}
              className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                user.role === 'user' ? 'cursor-default border-slate-600' : 'cursor-pointer border-slate-500 hover:border-cyan-400'
              }`}
            >
            </button>
            <span className="flex-1 text-white text-lg">{task.title}</span>
            {user.role !== 'user' && (
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {completedTasks.length > 0 && (
        <div className="pt-8">
          <h3 className="text-slate-500 font-medium mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Выполненные пункты ({completedTasks.length})
          </h3>
          <div className="space-y-3 opacity-60">
            {completedTasks.map(task => (
              <div 
                key={task.id} 
                className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-xl p-4"
              >
                <button
                  onClick={() => toggleTask(task)}
                  disabled={user.role === 'user'}
                  className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${
                    user.role === 'user' ? 'cursor-default border-emerald-500/30 bg-emerald-500/10' : 'cursor-pointer border-emerald-500 bg-emerald-500 hover:bg-emerald-600 transition-colors'
                  }`}
                >
                  <Check className={`w-4 h-4 ${user.role === 'user' ? 'text-emerald-500/50' : 'text-white'}`} />
                </button>
                <span className="flex-1 text-slate-400 line-through">{task.title}</span>
                {user.role !== 'user' && (
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
