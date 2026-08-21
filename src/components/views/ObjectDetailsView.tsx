import React, { useState, useEffect, useRef } from 'react';
import { User, TableObject } from '../../types';
import { getTableObjects, updateTableObject } from '../../utils/storage';
import { uploadProjectFile } from '../../utils/storage';
import { ArrowLeft, Paperclip, Loader2, FileText, Download, Trash2, Check } from 'lucide-react';

interface ObjectDetailsViewProps {
  user: User;
  objectId: string;
  onBack: () => void;
}

export default function ObjectDetailsView({ user, objectId, onBack }: ObjectDetailsViewProps) {
  const [obj, setObj] = useState<TableObject | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [confirmDialog, setConfirmDialog] = useState<{ message: string, action: () => void } | null>(null);

  const loadData = () => {
    const allObjects = getTableObjects();
    const found = allObjects.find(o => o.id === objectId);
    if (found) setObj(found);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('app-storage-changed', loadData);
    return () => window.removeEventListener('app-storage-changed', loadData);
  }, [objectId]);

  if (!obj) {
    return <div className="text-white">Объект не найден</div>;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadedFile = await uploadProjectFile(obj.id, file);
      const fullFile = { ...uploadedFile, id: Date.now().toString(), uploadedAt: Date.now() };
      
      const newFiles = [...(obj.files || []), fullFile];
      await updateTableObject({ ...obj, files: newFiles });
      
      // Clear input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(error instanceof Error ? error.message : 'Ошибка при загрузке файла');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (user.role !== 'admin') return;
    setConfirmDialog({
      message: 'Удалить этот файл?',
      action: async () => {
        const newFiles = (obj.files || []).filter(f => f.id !== fileId);
        await updateTableObject({ ...obj, files: newFiles });
      }
    });
  };

  const profit = obj.closingAmount - obj.costAmount;
  const physicalProgress = obj.progress || 0;
  const budgetProgress = obj.contractAmount ? Math.min(100, Math.round((obj.costAmount / obj.contractAmount) * 100)) : 0;
  const isOverbudget = budgetProgress > physicalProgress;
  const barColor = isOverbudget 
    ? 'bg-gradient-to-r from-red-500 to-rose-500' 
    : (obj.color || 'bg-gradient-to-r from-blue-500 to-cyan-500');

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="bg-slate-800 border border-slate-700 text-slate-300 p-2 rounded-xl hover:bg-slate-700 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">{obj.name}</h2>
          <p className="text-sm text-slate-400">Заказчик: <span className="font-bold text-slate-300">{obj.customer || 'Не указан'}</span></p>
        </div>
        {obj.isCompleted && (
          <div className="ml-auto flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-sm font-bold">
            <Check className="w-4 h-4" /> Объект сдан
          </div>
        )}
      </div>

      {user.role === 'admin' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700/50 shadow-sm">
          <div>
            <div className="text-slate-500 text-xs uppercase font-bold mb-1">Сумма контракта</div>
            <div className="text-xl font-black text-white">{obj.contractAmount.toLocaleString('ru-RU')} <span className="text-sm text-slate-500">₽</span></div>
          </div>
          <div>
            <div className="text-slate-500 text-xs uppercase font-bold mb-1">Сумма закрытия</div>
            <div className="text-xl font-black text-white">{obj.closingAmount.toLocaleString('ru-RU')} <span className="text-sm text-slate-500">₽</span></div>
          </div>
          <div>
            <div className="text-slate-500 text-xs uppercase font-bold mb-1">Потрачено</div>
            <div className="text-xl font-black text-slate-300">{obj.costAmount.toLocaleString('ru-RU')} <span className="text-sm text-slate-500">₽</span></div>
          </div>
          <div>
            <div className="text-slate-500 text-xs uppercase font-bold mb-1">Прибыль</div>
            <div className={`text-xl font-black ${profit < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {profit.toLocaleString('ru-RU')} <span className="text-sm opacity-50">₽</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/50 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Прогресс выполнения</h3>
          <span className={`font-bold ${isOverbudget ? 'text-red-400' : 'text-cyan-400'}`}>{physicalProgress}%</span>
        </div>
        <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700/50">
          <div className={`${barColor} h-full transition-all duration-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]`} style={{ width: `${physicalProgress}%` }}></div>
        </div>
      </div>

      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" /> Файлы и документы объекта
            </h3>
            <p className="text-xs text-slate-400 mt-1 pl-7">Максимальный размер файла: 800 КБ</p>
          </div>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-70"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
            {isUploading ? 'Загрузка...' : 'Загрузить файл'}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
        </div>
        
        <div className="p-6">
          {(!obj.files || obj.files.length === 0) ? (
            <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-slate-700/30 border-dashed">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Нет прикрепленных файлов к этому объекту</p>
              <p className="text-slate-500 text-sm mt-1">Загрузите сметы, чертежи, чеки и другие документы</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {obj.files.map((file) => (
                <div key={file.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex flex-col group hover:border-cyan-500/50 transition-colors">
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white truncate mb-1" title={file.name}>{file.name}</h4>
                  <p className="text-xs text-slate-500 mb-4">{new Date(file.uploadedAt).toLocaleDateString('ru-RU')}</p>
                  
                  <div className="mt-auto flex items-center gap-2 pt-3 border-t border-slate-700/50">
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Скачать
                    </a>
                    {(user.role === 'admin') && (
                      <button 
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                        title="Удалить файл"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
