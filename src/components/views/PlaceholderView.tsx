import React, { useState, useEffect, useRef } from 'react';
import { Construction, Image as ImageIcon, X, Trash2 } from 'lucide-react';
import { User, Note } from '../../types';
import { getStorageNotes, addStorageNote, deleteStorageNote } from '../../utils/storage';

interface PlaceholderViewProps {
  title: string;
  tabId: string;
  user: User;
}

export default function PlaceholderView({ title, tabId, user }: PlaceholderViewProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newImage, setNewImage] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadNotes = () => {
    const allNotes = getStorageNotes();
    setNotes(allNotes.filter(n => n.tabId === tabId));
  };

  useEffect(() => {
    loadNotes();
  }, [tabId]);

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

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() && !newImage) return;
    addStorageNote(newNote.trim(), user, tabId, newImage);
    setNewNote('');
    removeImage();
    loadNotes();
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Вы действительно хотите удалить эту запись?')) {
      deleteStorageNote(id);
      loadNotes();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 text-white border border-slate-700/50 shadow-sm p-8 flex flex-col items-center justify-center text-center min-h-[250px]">
        <div className="w-16 h-16 bg-slate-700/50 rounded flex items-center justify-center mb-4">
          <Construction className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-2">Раздел в разработке</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Макет для раздела «{title}». Здесь будет отображаться соответствующая информация.
        </p>
      </div>

      <div className="bg-slate-800/80 text-white border border-slate-700/50 shadow-sm p-4 mt-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wide">Доска объявлений и правок ({title})</h3>
        </div>
        
        {user.role === 'admin' && (
          <form onSubmit={handleAddNote} className="mb-6 flex flex-col gap-2">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={`Добавить правку/запись в раздел ${title}...`} 
                className="flex-1 border border-slate-700/50 rounded px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
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
                className="bg-slate-700/50 text-slate-300 px-3 py-2 rounded hover:bg-slate-700 border border-slate-700/50 flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-500/50 text-white text-white px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wider hover:from-blue-700 hover:to-cyan-700 transition-colors">
                Опубликовать
              </button>
            </div>
            {newImage && (
              <div className="relative inline-block w-fit mt-2">
                <img src={newImage} alt="Preview" className="h-20 object-contain border border-slate-700/50 rounded" />
                <button 
                  type="button" 
                  onClick={removeImage} 
                  className="absolute -top-2 -right-2 bg-slate-800/80 text-white border border-slate-700/50 rounded-full p-0.5 text-slate-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>
        )}

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {notes.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-4 italic">Нет объявлений</div>
          ) : (
            notes.map(note => (
              <div key={note.id} className="p-3 bg-slate-900/50 border border-slate-700/30 rounded">
                <p className="text-sm text-white whitespace-pre-wrap">{note.content}</p>
                {note.imageUrl && (
                  <div className="mt-3">
                    <img src={note.imageUrl} alt="Attached" className="max-h-48 rounded border border-slate-700/50" />
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/30">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-500/50 text-white px-1.5 py-0.5 rounded uppercase">
                      АДМИН: {note.authorName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(note.createdAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  {user.role === 'admin' && (
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
