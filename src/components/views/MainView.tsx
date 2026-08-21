import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, ReceiptRussianRuble, TrendingUp, PiggyBank, Edit2, Check, Image as ImageIcon, X, Trash2, ChevronDown, ChevronRight, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { User, Note, TableObject, StatItem } from '../../types';
import ActiveObjectCard from './ActiveObjectCard';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getStorageNotes, addStorageNote, deleteStorageNote, getTableObjects, updateTableObject, getStorageStats, updateStorageStat } from '../../utils/storage';

interface MainViewProps {
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

export default function MainView({ user, onNavigateToProject }: MainViewProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newImage, setNewImage] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [objects, setObjects] = useState<TableObject[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  
  const [editingStatId, setEditingStatId] = useState<string | null>(null);
  const [editStatForm, setEditStatForm] = useState<StatItem | null>(null);

  const [editingObjId, setEditingObjId] = useState<string | null>(null);
  const [editObjForm, setEditObjForm] = useState<TableObject | null>(null);

  const [activeExpanded, setActiveExpanded] = useState(true);
  const [completedExpanded, setCompletedExpanded] = useState(true);
  const [newObjectName, setNewObjectName] = useState('');
  
  const [baseStats, setBaseStats] = useState({ contract: 0, closing: 0, profit: 0 });
  const [editingBase, setEditingBase] = useState<string | null>(null);
  const [editBaseValue, setEditBaseValue] = useState<string>('');

  const [newCompletedName, setNewCompletedName] = useState('');

  const loadData = () => {
    const allNotes = getStorageNotes();
    setNotes(allNotes.filter(n => !n.tabId || n.tabId === 'main').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setObjects(getTableObjects());
    setStats(getStorageStats());
  };

  useEffect(() => {
    loadData();
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('app-storage-changed', handleStorageChange);
    
    const unsub = onSnapshot(doc(db, 'settings', 'financial_base'), (docSnap) => {
      if (docSnap.exists()) {
        setBaseStats(docSnap.data() as { contract: number, closing: number, profit: number });
      } else {
        setDoc(doc(db, 'settings', 'financial_base'), { contract: 0, closing: 0, profit: 0 });
      }
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('app-storage-changed', handleStorageChange);
      unsub();
    };
  }, []);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() && !newImage) return;
    
addStorageNote(newNote, user, 'main', newImage);
    
    setNewNote('');
    setNewImage(undefined);
    loadData();
  };

  const handleDeleteNote = (id: string) => {
    deleteStorageNote(id);
    loadData();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setNewImage(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveStat = () => {
    if (editStatForm) {
      updateStorageStat(editStatForm);
      setEditingStatId(null);
      loadData();
    }
  };

  const handleSaveObject = () => {
    if (editObjForm) {
      const updatedObj = { ...editObjForm };
      if (updatedObj.progress !== undefined && updatedObj.progress >= 100) {
        updatedObj.progress = 100;
        updatedObj.isCompleted = true;
      }
      updateTableObject(updatedObj);
      setEditingObjId(null);
      loadData();
    }
  };

  const handleAddQuickObject = () => {
    if (!newObjectName.trim()) return;
    
    const newObj: TableObject = {
      id: Date.now().toString(),
      name: newObjectName,
      customer: 'Новый заказчик',
      contractAmount: 0,
      costAmount: 0,
      closingAmount: 0,
      progress: 0,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      isCompleted: false
    };
    
    updateTableObject(newObj).then(() => {
      setNewObjectName('');
      loadData();
    });
  };

  const handleAddCompleted = () => {
    if (!newCompletedName.trim()) return;
    
    const newObj: TableObject = {
      id: Date.now().toString(),
      name: newCompletedName,
      customer: 'Новый заказчик',
      contractAmount: 0,
      costAmount: 0,
      closingAmount: 0,
      progress: 100,
      color: 'bg-gradient-to-r from-emerald-500 to-green-500',
      isCompleted: true
    };
    
    updateTableObject(newObj).then(() => {
      setNewCompletedName('');
      loadData();
    });
  };
  const activeObjects = objects.filter(o => !o.isCompleted);
  const completedObjects = objects.filter(o => o.isCompleted);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full pb-8">
      
      {/* СТАТИСТИКА */}
      {user.role !== 'user' && (
        <div className="col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-4 grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 w-full mb-2">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col justify-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Активные стройки</div>
            <div className="text-2xl font-black text-white">{activeObjects.length}</div>
          </div>
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col justify-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Завершенные</div>
            <div className="text-2xl font-black text-white">{completedObjects.length}</div>
          </div>
          
          {(() => {
            const rawContract = objects.reduce((sum, o) => sum + (o.contractAmount || 0), 0);
            const rawClosing = objects.reduce((sum, o) => sum + (o.closingAmount || 0), 0);
            const rawCost = objects.reduce((sum, o) => sum + (o.costAmount || 0), 0);
            const rawProfit = rawClosing - rawCost;
            
            const displayContract = baseStats.contract + rawContract;
            const displayClosing = baseStats.closing + rawClosing;
            const displayProfit = baseStats.profit + rawProfit;
            
            const saveBase = (key: 'contract' | 'closing' | 'profit', newVal: number, rawVal: number) => {
              setDoc(doc(db, 'settings', 'financial_base'), { ...baseStats, [key]: newVal - rawVal }, { merge: true });
              setEditingBase(null);
            };

            return (
              <>
                {/* СУММА КОНТРАКТОВ */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col justify-center relative group">
                  {user.role === 'admin' && editingBase !== 'contract' && (
                    <button onClick={() => { setEditingBase('contract'); setEditBaseValue(String(displayContract)); }} className="absolute top-3 right-3 text-slate-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-1.5 bg-slate-800 rounded-lg border border-slate-700">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Сумма контрактов</div>
                  {editingBase === 'contract' ? (
                    <div className="flex gap-2 items-center">
                      <input type="number" value={editBaseValue} onChange={e => setEditBaseValue(e.target.value)} className="w-full text-lg font-black bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-white outline-none focus:border-cyan-500" />
                      <button onClick={() => saveBase('contract', Number(editBaseValue) || 0, rawContract)} className="text-cyan-400 bg-cyan-500/20 p-1.5 rounded"><Check className="w-4 h-4"/></button>
                    </div>
                  ) : (
                    <div className="text-lg sm:text-xl 2xl:text-2xl font-black text-white flex items-baseline gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">{displayContract.toLocaleString('ru-RU')} <span className="text-slate-500 text-sm 2xl:text-lg">₽</span></div>
                  )}
                </div>

                {/* СУММА ЗАКРЫТИЯ */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col justify-center relative group">
                  {user.role === 'admin' && editingBase !== 'closing' && (
                    <button onClick={() => { setEditingBase('closing'); setEditBaseValue(String(displayClosing)); }} className="absolute top-3 right-3 text-slate-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-1.5 bg-slate-800 rounded-lg border border-slate-700">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Сумма закрытия</div>
                  {editingBase === 'closing' ? (
                    <div className="flex gap-2 items-center">
                      <input type="number" value={editBaseValue} onChange={e => setEditBaseValue(e.target.value)} className="w-full text-lg font-black bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-white outline-none focus:border-cyan-500" />
                      <button onClick={() => saveBase('closing', Number(editBaseValue) || 0, rawClosing)} className="text-cyan-400 bg-cyan-500/20 p-1.5 rounded"><Check className="w-4 h-4"/></button>
                    </div>
                  ) : (
                    <div className="text-lg sm:text-xl 2xl:text-2xl font-black text-white flex items-baseline gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">{displayClosing.toLocaleString('ru-RU')} <span className="text-slate-500 text-sm 2xl:text-lg">₽</span></div>
                  )}
                </div>

                {/* ЧИСТАЯ ПРИБЫЛЬ */}
                <div className="col-span-2 lg:col-span-1 bg-slate-800/80 p-5 rounded-2xl border border-emerald-500/30 shadow-xl flex flex-col justify-center bg-gradient-to-br from-emerald-900/40 to-slate-800/80 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-emerald-500/20 transition-colors"></div>
                  {user.role === 'admin' && editingBase !== 'profit' && (
                    <button onClick={() => { setEditingBase('profit'); setEditBaseValue(String(displayProfit)); }} className="absolute top-3 right-3 text-emerald-500 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity z-20 p-1.5 bg-emerald-900/50 rounded-lg border border-emerald-500/50">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1 tracking-wider relative z-10">Чистая прибыль</div>
                  {editingBase === 'profit' ? (
                    <div className="flex gap-2 items-center relative z-20">
                      <input type="number" value={editBaseValue} onChange={e => setEditBaseValue(e.target.value)} className="w-full text-lg font-black bg-emerald-900/50 border border-emerald-500/50 rounded px-2 py-1 text-emerald-400 outline-none focus:border-emerald-400" />
                      <button onClick={() => saveBase('profit', Number(editBaseValue) || 0, rawProfit)} className="text-emerald-400 bg-emerald-500/20 p-1.5 rounded border border-emerald-500/30"><Check className="w-4 h-4"/></button>
                    </div>
                  ) : (
                    <div className="text-xl sm:text-xl 2xl:text-2xl font-black text-emerald-400 relative z-10 flex items-baseline gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">{displayProfit.toLocaleString('ru-RU')} <span className="text-emerald-500/50 text-sm 2xl:text-lg">₽</span></div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* АКТИВНЫЕ ОБЪЕКТЫ */}
      {user.role !== 'user' && (
        <div className="col-span-1 sm:col-span-2 md:col-span-2 bg-slate-800/80 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
          <div 
            className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-700/30 transition-colors border-b border-slate-700/50"
            onClick={() => setActiveExpanded(!activeExpanded)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                {activeExpanded ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4 text-cyan-400" />}
              </div>
              <h3 className="text-sm font-bold uppercase text-white tracking-wider">Активные стройки</h3>
            </div>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">В РАБОТЕ</span>
          </div>
          
          {activeExpanded && (
            <div className="p-5 flex-1 flex flex-col">
              {user.role === 'admin' && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-5">
                  <input 
                    type="text" 
                    value={newObjectName}
                    onChange={e => setNewObjectName(e.target.value)}
                    placeholder="Вписать название новой стройки..."
                    className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder-slate-500"
                  />
                  <button 
                    onClick={handleAddQuickObject}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold text-sm shadow-lg shadow-cyan-900/20 sm:w-auto w-full shrink-0"
                  >
                    <Plus className="w-4 h-4" /> <span>Добавить</span>
                  </button>
                </div>
              )}

              <div className="space-y-3 overflow-y-auto pr-2 max-h-[400px] custom-scrollbar pb-4">
                {activeObjects.length === 0 ? (
                  <div className="text-sm text-slate-500 text-center py-8">Нет активных строек</div>
                ) : (
                  activeObjects.map((obj, index) => (
                    <ActiveObjectCard key={obj.id} obj={obj} index={index} user={user} onNavigate={() => onNavigateToProject && onNavigateToProject(obj.id)} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ЗАВЕРШЕННЫЕ ОБЪЕКТЫ */}
      {user.role !== 'user' && (
        <div className="col-span-1 sm:col-span-2 md:col-span-2 bg-slate-800/80 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
          <div 
            className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-700/30 transition-colors border-b border-slate-700/50"
            onClick={() => setCompletedExpanded(!completedExpanded)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                {completedExpanded ? <ChevronDown className="w-4 h-4 text-emerald-400" /> : <ChevronRight className="w-4 h-4 text-emerald-400" />}
              </div>
              <h3 className="text-sm font-bold uppercase text-white tracking-wide">Завершенные объекты</h3>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> СДАНЫ
            </span>
          </div>
          
          {completedExpanded && (
            <div className="p-5 flex flex-col h-full">
              {user.role === 'admin' && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
                  <input
                    type="text"
                    value={newCompletedName}
                    onChange={(e) => setNewCompletedName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddCompleted(); }}
                    placeholder="Вписать название завершенной стройки..."
                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500/50 outline-none transition-colors placeholder-slate-500"
                  />
                  <button
                    onClick={handleAddCompleted}
                    disabled={!newCompletedName.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors sm:w-auto w-full shrink-0"
                  >
                    <Plus className="w-4 h-4" /> <span>Добавить</span>
                  </button>
                </div>
              )}
              <div className="space-y-3 overflow-y-auto max-h-[400px] custom-scrollbar pb-4">
              {completedObjects.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-8">Нет завершенных строек</div>
              ) : (
                completedObjects.map((obj, index) => (
                  <ActiveObjectCard key={obj.id} obj={obj} index={index} user={user} onNavigate={() => onNavigateToProject && onNavigateToProject(obj.id)} />
                ))
              )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ДОСКА ОБЪЯВЛЕНИЙ */}
      <div className="col-span-1 md:col-span-4 bg-slate-800/80 rounded-2xl border border-slate-700/50 shadow-xl p-5 md:p-6 mt-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold uppercase text-white tracking-wide">Доска объявлений и правок</h3>
          </div>
        </div>
        
        {user.role === 'admin' && (
          <form onSubmit={handleAddNote} className="mb-8 bg-slate-900/30 p-4 rounded-xl border border-slate-700/50">
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                 type="text" 
                 value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Напишите объявление или информацию о правках..." 
                 className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all placeholder-slate-500"
              />
              <div className="flex gap-2 sm:w-auto w-full">
                <input 
                   type="file" 
                   accept="image/*" 
                   ref={fileInputRef} 
                   onChange={handleImageChange} 
                   className="hidden" 
                 />
                <button 
                   type="button" 
                   onClick={() => fileInputRef.current?.click()} 
                   className="bg-slate-800 text-slate-300 px-4 py-3 rounded-xl hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors flex items-center justify-center shrink-0"
                   title="Прикрепить картинку"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-900/20 whitespace-nowrap flex items-center justify-center shrink-0">
                  Опубликовать
                </button>
              </div>
            </div>
            
            {newImage && (
              <div className="relative inline-block w-fit mt-4">
                <div className="p-1 bg-slate-800 rounded-xl border border-slate-700 inline-block">
                  <img src={newImage} alt="Preview" className="h-32 object-cover rounded-lg" />
                </div>
                <button 
                   type="button" 
                   onClick={removeImage} 
                   className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors border border-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
          {notes.length === 0 ? (
            <div className="col-span-full text-sm text-slate-500 text-center py-12 bg-slate-900/20 rounded-xl border border-slate-700/30 border-dashed">
              Доска объявлений пуста
            </div>
          ) : (
            notes.map(note => (
              <div key={note.id} className="p-5 bg-slate-700/20 border border-slate-700/50 rounded-xl hover:bg-slate-700/30 transition-colors flex flex-col h-full">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                      {note.authorName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-white bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                      {note.authorName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {new Date(note.createdAt).toLocaleString('ru-RU', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})}
                    </span>
                  </div>
                  {user.role === 'admin' && (
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors p-1.5 rounded-lg"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed flex-1">{note.content}</p>
                
                {note.imageUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/50">
                    <img src={note.imageUrl} alt="Attached" className="w-full object-cover max-h-64 hover:opacity-90 transition-opacity cursor-pointer" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
