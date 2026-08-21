import React, { useState, useEffect } from 'react';
import { User, TableObject } from '../../types';
import { getTableObjects, updateTableObject, deleteTableObject } from '../../utils/storage';
import { Check, Edit2, Plus, Trash2, X, ChevronDown, ChevronRight, Layers, Link2, Link2Off, Folder, FileText } from 'lucide-react';

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
  const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TableObject | null>(null);
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [addForm, setAddForm] = useState({ name: '', customer: '', newCustomer: '' });
  
  const [confirmDialog, setConfirmDialog] = useState<{ message: string, action: () => void } | null>(null);

  const loadData = () => {
    const data = getTableObjects();
    setObjects(data);
    
    // Auto-expand all by default if we haven't set them yet
    setExpandedCustomers(prev => {
      const customers = Array.from(new Set(data.map(o => o.customer || 'Без заказчика')));
      const next = { ...prev };
      customers.forEach(c => {
        if (next[c] === undefined) next[c] = true;
      });
      return next;
    });
  };

  useEffect(() => {
    loadData();
    window.addEventListener('app-storage-changed', loadData);
    return () => window.removeEventListener('app-storage-changed', loadData);
  }, []);

  const toggleCustomer = (customer: string) => {
    setExpandedCustomers(prev => ({ ...prev, [customer]: !prev[customer] }));
  };

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
    setConfirmDialog({
      message: 'Удалить объект?',
      action: () => {
        deleteTableObject(id);
        loadData();
      }
    });
  };

  const handleAdd = () => {
    const currentCustomers = Array.from(new Set(objects.map(o => o.customer || 'Без заказчика'))).sort();
    setAddForm({
      name: '',
      customer: currentCustomers.length > 0 ? currentCustomers[0] : '',
      newCustomer: ''
    });
    setCustomerMode(currentCustomers.length > 0 ? 'existing' : 'new');
    setShowAddModal(true);
  };

  const handleConfirmAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const customerName = customerMode === 'existing' ? addForm.customer : addForm.newCustomer;
    
    if (!addForm.name.trim() || !customerName.trim()) return;

    const newObj: TableObject = {
      id: Date.now().toString(),
      name: addForm.name.trim(),
      customer: customerName.trim(),
      contractAmount: 0,
      costAmount: 0,
      closingAmount: 0,
      isCompleted: false
    };
    updateTableObject(newObj);
    setShowAddModal(false);
    loadData();
    setEditingId(newObj.id);
    setEditForm(newObj);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleMerge = () => {
    if (selectedIds.length < 2) return;
    setConfirmDialog({
      message: 'Объединить выбранные объекты? (Первый выбранный станет главным)',
      action: () => {
        const masterId = selectedIds[0];
        const childrenIds = selectedIds.slice(1);
        
        childrenIds.forEach(id => {
          const obj = objects.find(o => o.id === id);
          if (obj) {
            updateTableObject({ ...obj, mergedIntoId: masterId });
          }
        });
        
        setIsSelectionMode(false);
        setSelectedIds([]);
        loadData();
      }
    });
  };

  const handleUnmerge = (obj: TableObject) => {
    setConfirmDialog({
      message: 'Отменить объединение для этого объекта?',
      action: () => {
        updateTableObject({ ...obj, mergedIntoId: undefined });
        loadData();
      }
    });
  };

  const handleBulkUnmerge = () => {
    if (selectedIds.length === 0) return;
    setConfirmDialog({
      message: 'Отменить объединение для выбранных объектов?',
      action: () => {
        let hasChanges = false;
        
        objects.forEach(obj => {
          if (selectedIds.includes(obj.id) && obj.mergedIntoId) {
            updateTableObject({ ...obj, mergedIntoId: undefined });
            hasChanges = true;
          }
          if (obj.mergedIntoId && selectedIds.includes(obj.mergedIntoId)) {
            updateTableObject({ ...obj, mergedIntoId: undefined });
            hasChanges = true;
          }
        });
        
        setIsSelectionMode(false);
        setSelectedIds([]);
        if (hasChanges) loadData();
      }
    });
  };

  const customers = Array.from(new Set<string>(objects.map(o => o.customer || 'Без заказчика'))).sort();

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Объекты и Проекты</h2>
        
        {user.role === 'admin' && (
          <div className="flex flex-wrap gap-2">
            {isSelectionMode ? (
              <>
                <button 
                  onClick={handleMerge}
                  disabled={selectedIds.length < 2}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/20"
                >
                  <Link2 className="w-4 h-4" />
                  Объединить ({selectedIds.length})
                </button>
                <button 
                  onClick={handleBulkUnmerge}
                  disabled={selectedIds.length === 0}
                  className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Link2Off className="w-4 h-4" />
                  Разъединить
                </button>
                <button 
                  onClick={() => { setIsSelectionMode(false); setSelectedIds([]); }}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  Отмена
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsSelectionMode(true)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                Выделить
              </button>
            )}
            
            <button 
              onClick={handleAdd}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-cyan-900/20"
            >
              <Plus className="w-4 h-4" />
              Добавить объект
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {customers.map(customer => {
          const isExpanded = expandedCustomers[customer];
          const customerObjects = objects.filter(o => (o.customer || 'Без заказчика') === customer);
          
          return (
            <div key={customer} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-4 bg-slate-800/80 hover:bg-slate-700/50 transition-colors cursor-pointer select-none" onClick={() => toggleCustomer(customer)}>
                <div className="flex items-center gap-3 flex-1 text-left">
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                  <span className="text-sm font-medium text-slate-400">Заказчик:</span>
                  <span className="text-lg font-bold text-white">{customer}</span>
                  <span className="bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-full font-medium ml-2">
                    {customerObjects.length}
                  </span>
                </div>
              </div>
              
              {isExpanded && (
                <div className="border-t border-slate-700 bg-slate-900/50 overflow-x-auto">
                  {customerObjects.length === 0 ? (
                    <div className="text-slate-400 text-sm text-center py-6 italic">Нет объектов</div>
                  ) : (
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead>
                        <tr className="bg-slate-900/80 border-b border-slate-700/50">
                          {isSelectionMode && <th className="p-3 w-10"></th>}
                          <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-10"></th>
                          <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Название объекта</th>
                          <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Сумма контракта</th>
                          <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Сумма затрат</th>
                          <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Сумма закрытия</th>
                          <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Прибыль</th>
                          {user.role === 'admin' && <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right w-24">Действия</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {customerObjects.map(obj => {
                          const isEditing = editingId === obj.id;
                          
                          // Calculate displayed values based on merge logic
                          let displayContract = obj.contractAmount;
                          let displayCost = obj.costAmount;
                          let displayClosing = obj.closingAmount;
                          
                          const isChild = !!obj.mergedIntoId;
                          const mergedChildren = objects.filter(o => o.mergedIntoId === obj.id);
                          const isMaster = mergedChildren.length > 0;
                          
                          if (isChild) {
                            displayContract = 0;
                            displayCost = 0;
                            displayClosing = 0;
                          } else if (isMaster) {
                            mergedChildren.forEach(child => {
                              displayContract += child.contractAmount;
                              displayCost += child.costAmount;
                              displayClosing += child.closingAmount;
                            });
                          }
                          
                          const displayProfit = displayClosing - displayCost;
                          
                          const rowBg = obj.isCompleted 
                            ? 'bg-emerald-500/5' 
                            : isMaster 
                              ? 'bg-indigo-900/20' 
                              : isChild 
                                ? 'bg-indigo-900/10 opacity-75' 
                                : 'hover:bg-slate-800/50';
                                
                          const borderColor = (isMaster || isChild) ? 'border-indigo-500/30' : 'border-slate-700/30';
                          
                          if (isEditing && editForm) {
                            return (
                              <tr key={obj.id} className="bg-blue-900/20 border-b border-blue-500/30">
                                {isSelectionMode && <td className="p-3 text-center"></td>}
                                <td className="p-3 text-center"></td>
                                <td className="p-3">
                                  <DebouncedInput value={editForm.name} onChange={val => setEditForm({...editForm, name: val})} className="w-full text-xs p-2 bg-slate-900/80 border border-slate-600 rounded text-white outline-none focus:border-blue-500" placeholder="Название" />
                                  <div className="mt-1">
                                    <DebouncedInput value={editForm.customer} onChange={val => setEditForm({...editForm, customer: val})} className="w-full text-xs p-1 bg-slate-900/50 border border-slate-700 rounded text-slate-400 outline-none" placeholder="Заказчик" />
                                  </div>
                                </td>
                                <td className="p-3">
                                  <DebouncedInput type="number" value={editForm.contractAmount} onChange={val => setEditForm({...editForm, contractAmount: parseInt(val)||0})} className="w-full text-xs p-2 bg-slate-900/80 border border-slate-600 rounded text-white outline-none focus:border-blue-500 text-right" />
                                </td>
                                <td className="p-3">
                                  <DebouncedInput type="number" value={editForm.costAmount} onChange={val => setEditForm({...editForm, costAmount: parseInt(val)||0})} className="w-full text-xs p-2 bg-slate-900/80 border border-slate-600 rounded text-white outline-none focus:border-blue-500 text-right" />
                                </td>
                                <td className="p-3">
                                  <DebouncedInput type="number" value={editForm.closingAmount} onChange={val => setEditForm({...editForm, closingAmount: parseInt(val)||0})} className="w-full text-xs p-2 bg-slate-900/80 border border-slate-600 rounded text-white outline-none focus:border-blue-500 text-right" />
                                </td>
                                <td className="p-3 text-right text-xs font-bold text-white">
                                  {((editForm.closingAmount) - (editForm.costAmount)).toLocaleString('ru-RU')} ₽
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button onClick={handleSave} className="text-cyan-400 hover:text-blue-300 p-1 bg-slate-800 rounded"><Check className="w-4 h-4" /></button>
                                    <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-300 p-1 bg-slate-800 rounded"><X className="w-4 h-4" /></button>
                                  </div>
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={obj.id} className={`border-b ${borderColor} transition-colors ${rowBg}`}>
                              {isSelectionMode && (
                                <td className="p-3 text-center">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedIds.includes(obj.id)}
                                    onChange={() => toggleSelection(obj.id)}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-indigo-500 cursor-pointer"
                                  />
                                </td>
                              )}
                              <td className="p-3 text-center">
                                <button 
                                  onClick={() => handleToggleComplete(obj)}
                                  disabled={user.role !== 'admin'}
                                  className={`w-5 h-5 rounded flex items-center justify-center transition-all ${obj.isCompleted ? 'bg-emerald-500 text-white' : 'border border-slate-500 text-transparent hover:border-emerald-500'}`}
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              </td>
                              <td className="p-3 relative group">
                                <div className="flex items-center gap-2">
                                  {isMaster && <Layers className="w-4 h-4 text-indigo-400" title="Главный объект (объединен)" />}
                                  {isChild && <Link2 className="w-4 h-4 text-indigo-400/50" title={`Присоединен к другому объекту`} />}
                                  <button 
                                    onClick={() => onNavigateToProject && onNavigateToProject(obj.id)} 
                                    className={`text-sm font-bold transition-colors text-left flex items-center gap-2 ${obj.isCompleted ? 'text-slate-400' : isMaster || isChild ? 'text-indigo-300 hover:text-indigo-200' : 'text-white hover:text-cyan-400'}`}
                                  >
                                    <Folder className="w-4 h-4 opacity-50" />
                                    {obj.name}
                                  </button>
                                </div>
                              </td>
                              <td className={`p-3 text-sm font-medium text-right ${isChild ? 'text-slate-600' : 'text-slate-300'}`}>
                                {displayContract.toLocaleString('ru-RU')} ₽
                              </td>
                              <td className={`p-3 text-sm font-medium text-right ${isChild ? 'text-slate-600' : 'text-slate-300'}`}>
                                {displayCost.toLocaleString('ru-RU')} ₽
                              </td>
                              <td className={`p-3 text-sm font-medium text-right ${isChild ? 'text-slate-600' : 'text-slate-300'}`}>
                                {displayClosing.toLocaleString('ru-RU')} ₽
                              </td>
                              <td className={`p-3 text-sm font-bold text-right ${isChild ? 'text-slate-600' : displayProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {displayProfit.toLocaleString('ru-RU')} ₽
                              </td>
                              {user.role === 'admin' && (
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    {isChild && (
                                      <button onClick={() => handleUnmerge(obj)} className="text-slate-500 hover:text-indigo-400 p-1.5 rounded bg-slate-800/50 transition-colors" title="Отменить объединение">
                                        <Link2Off className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button onClick={() => { setEditingId(obj.id); setEditForm(obj); }} className="text-slate-500 hover:text-cyan-400 p-1.5 rounded bg-slate-800/50 transition-colors">
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete(obj.id)} className="text-slate-500 hover:text-red-400 p-1.5 rounded bg-slate-800/50 transition-colors">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {customers.length === 0 && (
          <div className="text-center text-slate-400 py-12 bg-slate-800/30 rounded-2xl border border-slate-700/50 border-dashed">
            Нет добавленных объектов
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white">Добавление объекта</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleConfirmAdd} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Название объекта</label>
                <input 
                  type="text"
                  required
                  autoFocus
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder="Например: Ремонт офиса"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Где создать?</label>
                <div className="flex gap-4 mb-3">
                  <label className={`flex items-center gap-2 cursor-pointer ${customers.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input 
                      type="radio" 
                      name="customerMode" 
                      checked={customerMode === 'existing'}
                      onChange={() => setCustomerMode('existing')}
                      className="accent-cyan-500 w-4 h-4"
                      disabled={customers.length === 0}
                    />
                    <span className="text-sm text-slate-300">Существующий заказчик</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="customerMode" 
                      checked={customerMode === 'new'}
                      onChange={() => setCustomerMode('new')}
                      className="accent-cyan-500 w-4 h-4"
                    />
                    <span className="text-sm text-slate-300">Новый заказчик</span>
                  </label>
                </div>

                {customerMode === 'existing' ? (
                  <select
                    value={addForm.customer}
                    onChange={(e) => setAddForm({ ...addForm, customer: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  >
                    {customers.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text"
                    required
                    value={addForm.newCustomer}
                    onChange={(e) => setAddForm({ ...addForm, newCustomer: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="Название нового заказчика"
                  />
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-700/50 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={!addForm.name.trim() || (customerMode === 'existing' ? !addForm.customer.trim() : !addForm.newCustomer.trim())}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-700 p-6 space-y-6">
            <h3 className="text-lg font-bold text-white text-center">Подтверждение</h3>
            <p className="text-slate-300 text-center text-sm">{confirmDialog.message}</p>
            <div className="flex justify-center gap-3 pt-2">
              <button 
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                Отмена
              </button>
              <button 
                onClick={() => {
                  confirmDialog.action();
                  setConfirmDialog(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-900/20"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
