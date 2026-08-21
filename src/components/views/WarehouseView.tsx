import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, PackagePlus, Download, Trash2, FolderPlus, Edit2, Settings, ArrowUp, ArrowDown, Plus, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { User, WarehouseItem, WarehouseCategory, WarehouseColumnDef } from '../../types';
import { getWarehouseItems, updateWarehouseItem, deleteWarehouseItem, getWarehouseCategories, addWarehouseCategory, deleteWarehouseCategory, getWarehouseColumnsConfig, updateWarehouseColumnsConfig } from '../../utils/storage';

interface WarehouseViewProps {
  user: User;
}

export default function WarehouseView({ user }: WarehouseViewProps) {
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [columnsConfig, setColumnsConfig] = useState<Record<string, WarehouseColumnDef[]>>({});
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showColumnManageModal, setShowColumnManageModal] = useState(false);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [managingCategory, setManagingCategory] = useState<string | null>(null);
  const [managingColumns, setManagingColumns] = useState<WarehouseColumnDef[]>([]);
  
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newItem, setNewItem] = useState<Partial<WarehouseItem>>({
    category: '',
    name: '',
    quantity: 1,
    unit: 'шт',
    notes: '',
    customFields: {}
  });

  const loadData = () => {
    setItems(getWarehouseItems());
    const cats = getWarehouseCategories();
    setCategories(cats);
    setColumnsConfig(getWarehouseColumnsConfig());
    
    if (cats.length > 0 && !newItem.category) {
      setNewItem(prev => ({ ...prev, category: cats[0] }));
    }

    setExpandedCats(prev => {
      const newExpanded = { ...prev };
      cats.forEach(c => {
        if (newExpanded[c] === undefined) newExpanded[c] = true;
      });
      return newExpanded;
    });
  };

  useEffect(() => {
    loadData();
    window.addEventListener('app-storage-changed', loadData);
    return () => window.removeEventListener('app-storage-changed', loadData);
  }, []);

  const toggleCategory = (cat: string) => {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleExport = (category: string) => {
    const catItems = items.filter(i => i.category === category);
    const cols = columnsConfig[category] || columnsConfig['Материал'] || [];
    
    const data = catItems.map(item => {
      const row: any = {};
      cols.forEach(col => {
        if (col.id === 'name') row[col.label] = item.name;
        else if (col.id === 'quantity') row[col.label] = item.quantity;
        else if (col.id === 'unit') row[col.label] = item.unit;
        else if (col.id === 'notes') row[col.label] = item.notes;
        else row[col.label] = item.customFields?.[col.id] || '';
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Склад");
    XLSX.writeFile(wb, `Склад_${category}.xlsx`);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.category) return;
    
    const item: WarehouseItem = {
      id: modalMode === 'edit' && editingId ? editingId : Date.now().toString(),
      category: newItem.category as WarehouseCategory,
      name: newItem.name,
      quantity: Number(newItem.quantity) || 0,
      unit: newItem.unit || 'шт',
      notes: newItem.notes || '',
      customFields: newItem.customFields || {}
    };
    
    updateWarehouseItem(item);
    setShowAddModal(false);
    setNewItem({ category: categories.length > 0 ? categories[0] : 'Материал', name: '', quantity: 1, unit: 'шт', notes: '', customFields: {} });
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setNewItem({ category: categories.length > 0 ? categories[0] : 'Материал', name: '', quantity: 1, unit: 'шт', notes: '', customFields: {} });
    setShowAddModal(true);
  };

  const openEditModal = (item: WarehouseItem) => {
    setModalMode('edit');
    setEditingId(item.id);
    setNewItem({
      category: item.category,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes,
      customFields: item.customFields || {}
    });
    setShowAddModal(true);
  };

  const openColumnManageModal = (category: string) => {
    setManagingCategory(category);
    setManagingColumns([...(columnsConfig[category] || columnsConfig['Материал'] || [])]);
    setShowColumnManageModal(true);
  };

  const saveColumnConfig = () => {
    if (managingCategory) {
      updateWarehouseColumnsConfig(managingCategory, managingColumns);
      loadData();
    }
    setShowColumnManageModal(false);
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newCols = [...managingColumns];
    if (direction === 'up' && index > 0) {
      [newCols[index - 1], newCols[index]] = [newCols[index], newCols[index - 1]];
    } else if (direction === 'down' && index < newCols.length - 1) {
      [newCols[index + 1], newCols[index]] = [newCols[index], newCols[index + 1]];
    }
    setManagingColumns(newCols);
  };

  const removeColumn = (id: string) => {
    setManagingColumns(managingColumns.filter(c => c.id !== id));
  };

  const addCustomColumn = () => {
    const name = prompt('Введите название нового столбца:');
    if (name && name.trim()) {
      const newCol: WarehouseColumnDef = {
        id: `custom_${Date.now()}`,
        label: name.trim(),
        isBase: false
      };
      setManagingColumns([...managingColumns, newCol]);
    }
  };

  const activeCategoryCols = columnsConfig[newItem.category || (categories[0] || 'Материал')] || columnsConfig['Материал'] || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Склад</h2>
        <div className="flex gap-2">
          {user.role !== 'user' && (
            <>
              <button 
                onClick={() => setShowAddCategoryModal(true)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                Категория
              </button>
              <button 
                onClick={openAddModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <PackagePlus className="w-4 h-4" />
                Добавить товар
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {categories.map(category => {
          const isExpanded = expandedCats[category];
          const catItems = items.filter(i => i.category === category);
          const cols = columnsConfig[category] || columnsConfig['Материал'] || [];
          
          return (
            <div key={category} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-4 bg-slate-800/80 hover:bg-slate-700/50 transition-colors">
                <button 
                  onClick={() => toggleCategory(category)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                  <span className="text-lg font-bold text-white">{category}</span>
                  <span className="bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-full font-medium">
                    {catItems.length}
                  </span>
                </button>
                
                <div className="flex items-center gap-2">
                  {user.role !== 'user' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openColumnManageModal(category); }}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-600 px-3 py-1.5 rounded transition-colors"
                      title="Настроить столбцы"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">Столбцы</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleExport(category)}
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded transition-colors"
                    title="Скачать в Excel"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {user.role !== 'user' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Вы уверены, что хотите удалить категорию "${category}"?`)) {
                          deleteWarehouseCategory(category);
                        }
                      }}
                      className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded transition-colors ml-1"
                      title="Удалить категорию"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-4 border-t border-slate-700 bg-slate-900/50">
                  {catItems.length === 0 ? (
                    <div className="text-slate-400 text-sm text-center py-6 italic">
                      В этой категории пока нет позиций
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-slate-700 text-xs uppercase tracking-wider text-slate-400">
                            {cols.map(col => (
                              <th key={col.id} className="pb-3 px-2 font-medium">
                                {col.label}
                              </th>
                            ))}
                            <th className="pb-3 px-2 font-medium text-right w-20">Действия</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {catItems.map(item => (
                            <tr key={item.id} className="text-sm text-slate-300 hover:bg-slate-800/50 transition-colors">
                              {cols.map(col => {
                                let val: any = '';
                                if (col.id === 'name') val = item.name;
                                else if (col.id === 'quantity') val = item.quantity;
                                else if (col.id === 'unit') val = item.unit;
                                else if (col.id === 'notes') val = item.notes;
                                else val = item.customFields?.[col.id] || '';
                                
                                return (
                                  <td key={col.id} className={`py-3 px-2 ${col.id === 'name' ? 'font-medium text-white' : ''}`}>
                                    {val}
                                  </td>
                                );
                              })}
                              <td className="py-3 px-2 text-right">
                                {user.role !== 'user' && (
                                  <div className="flex justify-end gap-1">
                                    <button 
                                      onClick={() => openEditModal(item)}
                                      className="text-slate-500 hover:text-blue-400 p-1 rounded transition-colors"
                                      title="Редактировать"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        if (window.confirm(`Вы уверены, что хотите удалить "${item.name}"?`)) {
                                          deleteWarehouseItem(item.id);
                                        }
                                      }}
                                      className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                                      title="Удалить"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-lg text-white">
                {modalMode === 'edit' ? 'Редактировать позицию' : 'Добавить позицию'}
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddItem} className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Категория</label>
                <select 
                  value={newItem.category}
                  onChange={e => setNewItem({...newItem, category: e.target.value as WarehouseCategory})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              {activeCategoryCols.map(col => {
                if (col.id === 'name') {
                  return (
                    <div key={col.id}>
                      <label className="block text-sm font-medium text-slate-400 mb-1">{col.label}</label>
                      <input 
                        type="text" 
                        value={newItem.name}
                        onChange={e => setNewItem({...newItem, name: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  );
                }
                if (col.id === 'quantity') {
                  return (
                    <div key={col.id}>
                      <label className="block text-sm font-medium text-slate-400 mb-1">{col.label}</label>
                      <input 
                        type="number" 
                        value={newItem.quantity}
                        onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                        min="0"
                        step="any"
                        required
                      />
                    </div>
                  );
                }
                if (col.id === 'unit') {
                  return (
                    <div key={col.id}>
                      <label className="block text-sm font-medium text-slate-400 mb-1">{col.label}</label>
                      <input 
                        type="text" 
                        value={newItem.unit}
                        onChange={e => setNewItem({...newItem, unit: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  );
                }
                if (col.id === 'notes') {
                  return (
                    <div key={col.id}>
                      <label className="block text-sm font-medium text-slate-400 mb-1">{col.label}</label>
                      <input 
                        type="text" 
                        value={newItem.notes}
                        onChange={e => setNewItem({...newItem, notes: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  );
                }
                
                return (
                  <div key={col.id}>
                    <label className="block text-sm font-medium text-slate-400 mb-1">{col.label}</label>
                    <input 
                      type="text" 
                      value={newItem.customFields?.[col.id] || ''}
                      onChange={e => setNewItem({
                        ...newItem, 
                        customFields: { ...(newItem.customFields || {}), [col.id]: e.target.value }
                      })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                );
              })}
              
              <div className="pt-4 flex gap-3 pb-2 border-t border-slate-700">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-medium transition-colors"
                >
                  Отмена
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20"
                >
                  {modalMode === 'edit' ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
            <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900/50">
              <h3 className="text-lg font-bold text-white">Новая категория</h3>
              <button onClick={() => setShowAddCategoryModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newCategoryName.trim()) {
                addWarehouseCategory(newCategoryName.trim());
                setShowAddCategoryModal(false);
                setNewCategoryName('');
              }
            }} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Название категории</label>
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Например: Спецодежда"
                  required
                />
              </div>
              
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-medium transition-colors"
                >
                  Отмена
                </button>
                <button 
                  type="submit"
                  disabled={!newCategoryName.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-colors"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showColumnManageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900/50">
              <h3 className="text-lg font-bold text-white">
                Столбцы: {managingCategory}
              </h3>
              <button type="button" onClick={() => setShowColumnManageModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-2">
              <div className="text-sm text-slate-400 mb-4">
                Настройте порядок и наличие столбцов для данной категории.
              </div>
              
              {managingColumns.map((col, index) => (
                <div key={col.id} className="flex items-center justify-between bg-slate-900/50 border border-slate-700 p-3 rounded-lg">
                  <span className="text-white font-medium">{col.label}</span>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      onClick={() => moveColumn(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => moveColumn(index, 'down')}
                      disabled={index === managingColumns.length - 1}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-slate-700 mx-1"></div>
                    {col.isBase ? (
                      <div className="w-6" />
                    ) : (
                      <button 
                        type="button"
                        onClick={() => removeColumn(col.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                        title="Удалить столбец"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <button 
                type="button"
                onClick={addCustomColumn}
                className="w-full mt-4 py-3 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-400 hover:bg-slate-700/30 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Добавить столбец
              </button>
            </div>
            <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex gap-3 mt-auto">
              <button 
                type="button"
                onClick={() => setShowColumnManageModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                Отмена
              </button>
              <button 
                type="button"
                onClick={saveColumnConfig}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
