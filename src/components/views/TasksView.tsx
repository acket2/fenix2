import React, { useState, useEffect } from 'react';
import { User, Task } from '../../types';
import { getTasks, updateTask, deleteTask } from '../../utils/storage';
import { Check, Edit2, Plus, Trash2, X, Clock, User as UserIcon } from 'lucide-react';

interface TasksViewProps {
  user: User;
}

export default function TasksView({ user }: TasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add'|'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: ''
  });

  const loadData = () => {
    // Sort tasks by taskNumber descending
    const loaded = getTasks().sort((a, b) => (b.taskNumber || 0) - (a.taskNumber || 0));
    setTasks(loaded);
  };

  useEffect(() => { 
    loadData(); 
    window.addEventListener('app-storage-changed', loadData);
    return () => window.removeEventListener('app-storage-changed', loadData);
  }, []);

  const handleToggle = (task: Task) => {
    // Both admin and user can mark as completed
    const isNowCompleted = !task.isCompleted;
    
    updateTask({ 
      ...task, 
      isCompleted: isNowCompleted,
      completedBy: isNowCompleted ? user.login : undefined,
      completedAt: isNowCompleted ? Date.now() : undefined
    });
    loadData();
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setFormData({ title: '', description: '', assignee: '' });
    setShowAddModal(true);
  };

  const openEditModal = (task: Task) => {
    setModalMode('edit');
    setEditingId(task.id);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      assignee: task.assignee || ''
    });
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    if (modalMode === 'add') {
      const maxNumber = tasks.reduce((max, t) => Math.max(max, t.taskNumber || 0), 0);
      const newTask: Task = {
        id: Date.now().toString(),
        taskNumber: maxNumber + 1,
        title: formData.title,
        description: formData.description,
        assignee: formData.assignee,
        isCompleted: false
      };
      updateTask(newTask);
    } else if (editingId) {
      const task = tasks.find(t => t.id === editingId);
      if (task) {
        updateTask({
          ...task,
          title: formData.title,
          description: formData.description,
          assignee: formData.assignee
        });
      }
    }
    
    setShowAddModal(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
      deleteTask(id);
      loadData();
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Задачи</h2>
        {user.role === 'admin' && (
          <button 
            onClick={openAddModal}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold text-sm shadow-lg shadow-cyan-900/20"
          >
            <Plus className="w-4 h-4" /> <span>Создать задачу</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={`flex flex-col bg-slate-800/80 rounded-2xl border ${task.isCompleted ? 'border-emerald-500/30' : 'border-slate-700/50'} overflow-hidden shadow-xl relative transition-all group hover:-translate-y-1`}
          >
            {/* Header */}
            <div className={`p-4 border-b ${task.isCompleted ? 'bg-emerald-900/20 border-emerald-500/20' : 'bg-slate-900/50 border-slate-700/50'} flex justify-between items-start`}>
              <div>
                <div className="text-cyan-400 font-black text-sm mb-1">Задача #{task.taskNumber || '?'}</div>
                <h3 className={`font-bold text-lg leading-tight ${task.isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                  {task.title}
                </h3>
              </div>
              
              <div className="flex gap-2 shrink-0 ml-2">
                {user.role === 'admin' && (
                  <>
                    <button onClick={() => openEditModal(task)} className="text-slate-400 hover:text-cyan-400 p-1 bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(task.id)} className="text-slate-400 hover:text-red-400 p-1 bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                  </>
                )}
                <button 
                  onClick={() => handleToggle(task)}
                  className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all shadow-lg ${task.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-500 text-transparent hover:border-emerald-500'}`}
                  title={task.isCompleted ? "Отменить выполнение" : "Отметить выполненной"}
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col">
              {task.description && (
                <div className="text-slate-300 text-sm mb-4 whitespace-pre-wrap">
                  {task.description}
                </div>
              )}
              
              <div className="mt-auto space-y-2 pt-4 border-t border-slate-700/50">
                {task.assignee && (
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Исполнитель:</span>
                    <span className="text-white font-medium">{task.assignee}</span>
                  </div>
                )}
                
                {task.isCompleted && task.completedBy && task.completedAt && (
                  <div className="flex flex-col gap-1 text-xs bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="w-3 h-3" />
                      <span className="font-medium">Выполнил: {task.completedBy}</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-500/70">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(task.completedAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="col-span-full text-center text-slate-400 py-12 bg-slate-800/30 rounded-2xl border border-slate-700/50 border-dashed">
            Нет активных задач
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {modalMode === 'add' ? 'Новая задача' : 'Редактировать задачу'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Краткая суть (заголовок)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                  placeholder="Например: Починить инструмент"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Подробное описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 outline-none min-h-[100px]"
                  placeholder="Опишите задачу подробнее..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Кому относится (Исполнитель)</label>
                <input
                  type="text"
                  value={formData.assignee}
                  onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                  placeholder="Например: Вася Пупкин"
                />
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl transition-all shadow-lg"
                >
                  {modalMode === 'add' ? 'Создать задачу' : 'Сохранить изменения'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
