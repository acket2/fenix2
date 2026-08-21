import React, { useState, useRef } from 'react';
import { Edit2, Check, Paperclip, FileText, Loader2, Upload } from 'lucide-react';
import { User, TableObject } from '../../types';
import { updateTableObject, uploadProjectFile } from '../../utils/storage';

interface ActiveObjectCardProps {
  obj: TableObject;
  index: number;
  user: User;
  onNavigate?: () => void;
}

const ActiveObjectCard: React.FC<ActiveObjectCardProps> = ({ obj, index, user, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<TableObject>(obj);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const isCompleted = editForm.progress === 100;
    const finalForm = { ...editForm, isCompleted };
    updateTableObject(finalForm);
    setIsEditing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadedFile = await uploadProjectFile(obj.id, file);
      const fullFile = { ...uploadedFile, id: Date.now().toString(), uploadedAt: Date.now() };
      const newFiles = [...(obj.files || []), fullFile];
      await updateTableObject({ ...obj, files: newFiles });
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const remaining = obj.contractAmount - obj.costAmount;
  const isLoss = remaining < 0;

  // Рассчет перерасхода
  const physicalProgress = obj.progress || 0;
  const budgetProgress = obj.contractAmount ? Math.min(100, Math.round((obj.costAmount / obj.contractAmount) * 100)) : 0;
  const isOverbudget = budgetProgress > physicalProgress;
  
  const barColor = isOverbudget 
    ? 'bg-gradient-to-r from-red-500 to-rose-500' // Красный если перерасход
    : (obj.color || 'bg-gradient-to-r from-blue-500 to-cyan-500');

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-700/30 rounded-xl border border-slate-700/50 relative group transition-colors hover:bg-slate-700/50">
      {user.role === 'admin' && !isEditing && (
        <button 
          onClick={() => { setIsEditing(true); setEditForm(obj); }}
          className="absolute top-2 right-2 text-slate-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-slate-800 p-1.5 rounded-lg"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <div className="w-12 h-12 bg-slate-900/50 border border-slate-700/50 flex items-center justify-center rounded-xl font-bold text-slate-400 shrink-0">
          #{String(index + 1).padStart(2, '0')}
        </div>
        
        {isEditing ? (
          <div className="flex-1 space-y-3 pr-6 w-full">
            <input 
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              className="text-sm font-bold w-full border border-slate-700/50 rounded-lg px-3 py-2 outline-none bg-slate-900/50 text-white focus:border-cyan-500/50"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1 uppercase font-bold">Бюджет (₽)</span>
                <input type="number" value={editForm.contractAmount} onChange={e => setEditForm({...editForm, contractAmount: parseInt(e.target.value) || 0})} className="w-full text-sm border border-slate-700/50 rounded px-2 py-1 outline-none bg-slate-800 text-white" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1 uppercase font-bold">Закрытие (₽)</span>
                <input type="number" value={editForm.closingAmount} onChange={e => setEditForm({...editForm, closingAmount: parseInt(e.target.value) || 0})} className="w-full text-sm border border-slate-700/50 rounded px-2 py-1 outline-none bg-slate-800 text-white" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1 uppercase font-bold">Затраты (₽)</span>
                <input type="number" value={editForm.costAmount} onChange={e => setEditForm({...editForm, costAmount: parseInt(e.target.value) || 0})} className="w-full text-sm border border-slate-700/50 rounded px-2 py-1 outline-none bg-slate-800 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-900/30 p-2 rounded-lg border border-slate-700/30">
              <span className="text-xs text-slate-400">Прогресс:</span>
              <input 
                type="number"
                min="0" max="100"
                value={editForm.progress || 0}
                onChange={(e) => setEditForm({...editForm, progress: parseInt(e.target.value) || 0})}
                className="text-sm font-bold w-16 border border-slate-700/50 rounded px-2 py-1 outline-none bg-slate-800 text-white text-center"
              />
              <span className="text-xs font-bold text-slate-500">%</span>
              <button onClick={handleSave} className="text-cyan-400 ml-auto bg-cyan-500/10 p-1.5 rounded hover:bg-cyan-500/20"><Check className="w-5 h-5" /></button>
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full space-y-3">
            <button onClick={onNavigate} className="text-sm font-bold text-white pr-6 hover:text-cyan-400 text-left transition-colors cursor-pointer group-hover:text-cyan-300">{obj.name}</button>
            
            {/* Financial Block */}
            {user.role === 'admin' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 bg-slate-900/30 p-3 sm:p-2 rounded-lg border border-slate-700/30 text-xs">
                <div>
                  <div className="text-slate-500 mb-0.5 text-[10px] uppercase font-bold">Бюджет</div>
                  <div className="font-semibold text-white">{obj.contractAmount?.toLocaleString('ru-RU')} ₽</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-0.5 text-[10px] uppercase font-bold">Закрытие</div>
                  <div className="font-semibold text-white">{obj.closingAmount?.toLocaleString('ru-RU')} ₽</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-0.5 text-[10px] uppercase font-bold">Потрачено</div>
                  <div className="font-semibold text-slate-300">{obj.costAmount?.toLocaleString('ru-RU')} ₽</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-0.5 text-[10px] uppercase font-bold">Прибыль</div>
                  <div className={`font-semibold flex items-baseline gap-1 whitespace-nowrap overflow-hidden text-ellipsis ${((obj.closingAmount || 0) - (obj.costAmount || 0)) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {((obj.closingAmount || 0) - (obj.costAmount || 0)).toLocaleString('ru-RU')} <span className="text-[10px] opacity-50">₽</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700/50">
                <div className={`${barColor} h-full transition-all duration-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]`} style={{ width: `${physicalProgress}%` }}></div>
              </div>
              <div className={`text-xs font-bold min-w-[32px] text-right ${isOverbudget ? 'text-red-400' : 'text-cyan-400'}`}>{physicalProgress}%</div>
            </div>


          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(ActiveObjectCard);
