import React, { useState, useEffect, useRef } from 'react';
import { User, DocumentFile } from '../../types';
import { getDocuments, addDocument, deleteDocument } from '../../utils/storage';
import { FileText, Paperclip, Loader2, Download, Trash2, Plus } from 'lucide-react';

interface DocsViewProps {
  user: User;
}

export default function DocsView({ user }: DocsViewProps) {
  const [docs, setDocs] = useState<DocumentFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    setDocs(getDocuments());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('app-storage-changed', loadData);
    return () => window.removeEventListener('app-storage-changed', loadData);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await addDocument(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(error instanceof Error ? error.message : 'Ошибка при загрузке файла');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (user.role === 'user') return;
    if (confirm('Удалить этот документ?')) {
      await deleteDocument(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Документы</h2>
        
        {user.role !== 'user' && (
          <div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {isUploading ? 'Загрузка...' : 'Добавить документ'}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <p className="text-[10px] text-slate-400 mt-1 text-right">Макс. 800 КБ</p>
          </div>
        )}
      </div>

      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/50 shadow-sm overflow-hidden p-6">
        {docs.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-slate-700/30 border-dashed">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Нет загруженных документов</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {docs.map((file) => (
              <div key={file.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex flex-col group hover:border-cyan-500/50 transition-colors">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white truncate mb-1" title={file.name}>{file.name}</h4>
                <p className="text-xs text-slate-500 mb-4">{new Date(file.uploadedAt).toLocaleDateString('ru-RU')}</p>
                
                <div className="mt-auto flex items-center gap-2 pt-3 border-t border-slate-700/50">
                  <a 
                    href={file.url} 
                    download={file.name}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium py-2 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Скачать
                  </a>
                  {user.role !== 'user' && (
                    <button 
                      onClick={() => handleDelete(file.id)}
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
  );
}
