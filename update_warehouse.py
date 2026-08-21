import os

code = """import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, PackagePlus, Download, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { User, WarehouseItem, WarehouseCategory } from '../../types';
import { getWarehouseItems, updateWarehouseItem, deleteWarehouseItem } from '../../utils/storage';

interface WarehouseViewProps {
  user: User;
}

const CATEGORIES: WarehouseCategory[] = ['Ручной инструмент', 'Материал', 'Электро инструменты'];

export default function WarehouseView({ user }: WarehouseViewProps) {
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    'Ручной инструмент': true,
    'Материал': true,
    'Электро инструменты': true,
  });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<WarehouseItem>>({
    category: 'Материал',
    name: '',
    quantity: 1,
    unit: 'шт',
    notes: ''
  });

  const loadData = () => {
    setItems(getWarehouseItems());
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
    
    // Подготовка данных для Excel
    const data = catItems.map(item => ({
      'Наименование': item.name,
      'Количество': item.quantity,
      'Ед. изм.': item.unit,
      'Примечание': item.notes
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Склад");

    // Скачивание файла
    XLSX.writeFile(wb, `Склад_${category}.xlsx`);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.category) return;
    
    const item: WarehouseItem = {
      id: Date.now().toString(),
      category: newItem.category as WarehouseCategory,
      name: newItem.name,
      quantity: Number(newItem.quantity) || 0,
      unit: newItem.unit || 'шт',
      notes: newItem.notes || ''
    };
    
    updateWarehouseItem(item);
    setShowAddModal(false);
    setNewItem({ category: 'Материал', name: '', quantity: 1, unit: 'шт', notes: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Склад</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <PackagePlus className="w-4 h-4" />
          Добавить
        </button>
      </div>

      <div className="space-y-4">
        {CATEGORIES.map(category => {
          const isExpanded = expandedCats[category];
          const catItems = items.filter(i => i.category === category);
          
          return (
            <div key={category} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-slate-800/80 hover:bg-slate-700/50 transition-colors">
                <button 
                  onClick={() => toggleCategory(category)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                  <span className="text-lg font-medium text-white">{category}</span>
                  <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">
                    {catItems.length}
                  </span>
                </button>
                
                <button
                  onClick={() => handleExport(category)}
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded transition-colors"
                  title="Скачать в Excel"
                >
                  <Download className="w-4 h-4" />
                  <span>Скачать</span>
                </button>
              </div>
              
              {isExpanded && (
                <div className="p-4 border-t border-slate-700 bg-slate-900/50">
                  {catItems.length === 0 ? (
                    <div className="text-slate-400 text-sm text-center py-4 italic">
                      В этой категории пока нет позиций
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-700 text-xs uppercase tracking-wider text-slate-400">
                            <th className="pb-3 font-medium">Наименование</th>
                            <th className="pb-3 font-medium text-center">Кол-во</th>
                            <th className="pb-3 font-medium">Ед.изм.</th>
                            <th className="pb-3 font-medium hidden sm:table-cell">Примечание</th>
                            <th className="pb-3 font-medium text-right">Действия</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {catItems.map(item => (
                            <tr key={item.id} className="text-sm text-slate-300 hover:bg-slate-800/50">
                              <td className="py-3 font-medium text-white">{item.name}</td>
                              <td className="py-3 text-center">{item.quantity}</td>
                              <td className="py-3">{item.unit}</td>
                              <td className="py-3 text-slate-400 hidden sm:table-cell">{item.notes}</td>
                              <td className="py-3 text-right">
                                <button 
                                  onClick={() => deleteWarehouseItem(item.id)}
                                  className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                                  title="Удалить"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
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
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-lg text-white">Добавить позицию</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddItem} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Категория</label>
                <select 
                  value={newItem.category}
                  onChange={e => setNewItem({...newItem, category: e.target.value as WarehouseCategory})}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Наименование</label>
                <input 
                  type="text" 
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Например: Перфоратор Makita"
                  required
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Количество</label>
                  <input 
                    type="number" 
                    value={newItem.quantity}
                    onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    min="0"
                    step="any"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Ед. изм.</label>
                  <input 
                    type="text" 
                    value={newItem.unit}
                    onChange={e => setNewItem({...newItem, unit: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="шт, кг, м"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Примечание (необязательно)</label>
                <input 
                  type="text" 
                  value={newItem.notes}
                  onChange={e => setNewItem({...newItem, notes: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Доп. информация"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-medium transition-colors"
                >
                  Отмена
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition-colors"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
"""

with open("src/components/views/WarehouseView.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("WarehouseView.tsx created")
