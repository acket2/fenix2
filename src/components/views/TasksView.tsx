import React, { useState, useEffect } from 'react';
import { User, Task } from '../../types';
import { getTasks, updateTask, deleteTask } from '../../utils/storage';
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react';

interface TasksViewProps {
  user: User;
}


const DebouncedInput = ({ value, onChange, className, type = "text", placeholder = "", style = {}, autoFocus = false }: { value: any, onChange: (val: any) => void, className?: string, type?: string, placeholder?: string, style?: any, autoFocus?: boolean }) => {
  const [localValue, setLocalValue] = React.useState(value);
  React.useEffect(() => { setLocalValue(value); }, [value]);
  const handleBlur = () => { if (localValue !== value) onChange(localValue); };
  return (
    <input
      type={type}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
      className={className}
      placeholder={placeholder}
      style={style}
      autoFocus={autoFocus}
    />
  );
};

export default function TasksView({ user }: TasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<string>('');

  const loadData = () => setTasks(getTasks());

  useEffect(() => { 
    loadData(); 
    window.addEventListener('app-storage-changed', loadData);
    return () => window.removeEventListener('app-storage-changed', loadData);
  }, []);

  const handleToggle = (task: Task) => {
    if (user.role !== 'admin') return;
    updateTask({ ...task, isCompleted: !task.isCompleted });
    loadData();
  };

  const handleAdd = () => {
    const newTask: Task = { id: Date.now().toString(), title: 'Новая задача', isCompleted: false };
    updateTask(newTask);
    loadData();
    setEditingId(newTask.id);
    setEditForm(newTask.title);
  };

  const handleSave = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && editForm.trim()) {
      updateTask({ ...task, title: editForm.trim() });
    }
    setEditingId(null);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить задачу?')) {
      deleteTask(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full">
      <div className="bg-slate-800/80 text-white border border-slate-700/50 shadow-sm p-4 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wide">Задачи</h3>
          {user.role === 'admin' && (
            <button onClick={handleAdd} className="bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-500/50 text-white text-white p-1.5 rounded hover:from-blue-700 hover:to-cyan-700">
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-2">
          {tasks.map(task => {
            const isEditing = editingId === task.id;
            
            return (
              <div key={task.id} className={`flex items-center gap-3 p-3 border rounded transition-colors ${task.isCompleted ? 'bg-emerald-500/10/50 border-green-100' : 'bg-slate-800/80 text-white border-slate-700/50 hover:border-slate-300'}`}>
                <button 
                  onClick={() => handleToggle(task)}
                  disabled={user.role !== 'admin'}
                  className={`flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-emerald-500/100 border-green-500 text-white' : 'border-slate-300 text-transparent hover:border-green-500'}`}
                >
                  <Check className="w-4 h-4" />
                </button>
                
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-2">
                    <DebouncedInput value={editForm} onChange={val => setEditForm(val)} className="flex-1 text-sm p-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" autoFocus={true} />
                    <button onClick={() => handleSave(task.id)} className="text-cyan-400 hover:text-blue-800"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-300"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <>
                    <div className={`flex-1 text-sm ${task.isCompleted ? 'text-slate-400 line-through' : 'text-white font-medium'}`}>
                      {task.title}
                    </div>
                    {user.role === 'admin' && (
                      <div className="flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingId(task.id); setEditForm(task.title); }} className="text-slate-400 hover:text-cyan-400"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(task.id)} className="text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
          {tasks.length === 0 && <div className="text-center text-xs text-slate-400 py-8">Нет задач</div>}
        </div>
      </div>
    </div>
  );
}
