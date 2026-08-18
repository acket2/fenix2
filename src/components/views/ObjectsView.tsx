import React, { useState, useEffect } from 'react';
import { User, TableObject } from '../../types';
import { getTableObjects, updateTableObject, deleteTableObject } from '../../utils/storage';
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react';

interface ObjectsViewProps {
  user: User;
  onNavigateToProject?: (id: string) => void;
}


const DebouncedInput = ({ value, onChange, className, type = "text", placeholder = "", style = {} }: { value: any, onChange: (val: any) => void, className?: string, type?: string, placeholder?: string, style?: any }) => {
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
    />
  );
};

export default function ObjectsView({ user, onNavigateToProject }: ObjectsViewProps) {
  const [objects, setObjects] = useState<TableObject[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TableObject | null>(null);

  const loadData = () => {
    setObjects(getTableObjects());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('app-storage-changed', loadData);
    return () => window.removeEventListener('app-storage-changed', loadData);
  }, []);

  const handleToggleComplete = (obj: TableObject) => {
    if (user.role !== 'admin') return;
    updateTableObject({ ...obj, isCompleted: !obj.isCompleted });
    loadData();
  };

  const handleSave = () => {
    if (editForm) {
      updateTableObject(editForm);
      setEditingId(null);
      loadData();
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить объект?')) {
      deleteTableObject(id);
      loadData();
    }
  };

  const handleAdd = () => {
    const newObj: TableObject = {
      id: Date.now().toString(),
      name: 'Новый объект',
      customer: 'Имя заказчика',
      contractAmount: 0,
      costAmount: 0,
      closingAmount: 0,
      isCompleted: false
    };
    updateTableObject(newObj);
    loadData();
    setEditingId(newObj.id);
    setEditForm(newObj);
  };

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full">
      <div className="bg-slate-800/80 text-white border border-slate-700/50 shadow-sm p-4 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wide">Объекты</h3>
          {user.role === 'admin' && (
            <button onClick={handleAdd} className="bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-500/50 text-white text-white p-1.5 rounded hover:from-blue-700 hover:to-cyan-700">
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700/50">
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-10"></th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Название</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Заказчик</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Сумма контракта</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Сумма затрат</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Сумма закрытия</th>
                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Прибыль</th>
                {user.role === 'admin' && <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Действия</th>}
              </tr>
            </thead>
            <tbody>
              {objects.map(obj => {
                const isEditing = editingId === obj.id;
                const profit = obj.closingAmount - obj.costAmount;
                const rowClass = obj.isCompleted ? 'bg-emerald-500/10 line-through opacity-70' : 'bg-slate-800/80 text-white hover:bg-slate-900/50';
                
                if (isEditing && editForm) {
                  return (
                    <tr key={obj.id} className="border-b border-slate-700/30 bg-blue-50/50">
                      <td className="p-3 text-center"></td>
                      <td className="p-3">
                        <DebouncedInput value={editForm.name} onChange={val => setEditForm({...editForm, name: val})} className="w-full text-xs p-1 border border-slate-700/50 rounded" />
                      </td>
                      <td className="p-3">
                        <DebouncedInput value={editForm.customer} onChange={val => setEditForm({...editForm, customer: val})} className="w-full text-xs p-1 border border-slate-700/50 rounded" />
                      </td>
                      <td className="p-3">
                        <DebouncedInput type="number" value={editForm.contractAmount} onChange={val => setEditForm({...editForm, contractAmount: parseInt(val)||0})} className="w-full text-xs p-1 border border-slate-700/50 rounded text-right" />
                      </td>
                      <td className="p-3">
                        <DebouncedInput type="number" value={editForm.costAmount} onChange={val => setEditForm({...editForm, costAmount: parseInt(val)||0})} className="w-full text-xs p-1 border border-slate-700/50 rounded text-right" />
                      </td>
                      <td className="p-3">
                        <DebouncedInput type="number" value={editForm.closingAmount} onChange={val => setEditForm({...editForm, closingAmount: parseInt(val)||0})} className="w-full text-xs p-1 border border-slate-700/50 rounded text-right" />
                      </td>
                      <td className="p-3 text-right text-xs font-bold text-white">{(editForm.closingAmount - editForm.costAmount).toLocaleString('ru-RU')} ₽</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={handleSave} className="text-cyan-400 hover:text-blue-800"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-300"><X className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={obj.id} className={`border-b border-slate-700/30 transition-colors ${rowClass}`}>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => handleToggleComplete(obj)}
                        disabled={user.role !== 'admin'}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${obj.isCompleted ? 'bg-emerald-500/100 border-green-500 text-white' : 'border-slate-300 text-transparent hover:border-green-500'}`}
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="p-3 text-sm font-bold text-white"><button onClick={() => onNavigateToProject && onNavigateToProject(obj.id)} className="hover:text-cyan-400 transition-colors text-left">{obj.name}</button></td>
                    <td className="p-3 text-sm text-slate-300">{obj.customer}</td>
                    <td className="p-3 text-sm font-medium text-slate-300 text-right">{obj.contractAmount.toLocaleString('ru-RU')} ₽</td>
                    <td className="p-3 text-sm font-medium text-slate-300 text-right">{obj.costAmount.toLocaleString('ru-RU')} ₽</td>
                    <td className="p-3 text-sm font-medium text-slate-300 text-right">{obj.closingAmount.toLocaleString('ru-RU')} ₽</td>
                    <td className={`p-3 text-sm font-bold text-right ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{profit.toLocaleString('ru-RU')} ₽</td>
                    {user.role === 'admin' && (
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setEditingId(obj.id); setEditForm(obj); }} className="text-slate-400 hover:text-cyan-400"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(obj.id)} className="text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {objects.length === 0 && <div className="text-center text-xs text-slate-400 py-8">Нет добавленных объектов</div>}
        </div>
      </div>
    </div>
  );
}
