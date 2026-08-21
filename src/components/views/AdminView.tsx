import React, { useEffect, useState } from 'react';
import { RegistrationRequest, Role } from '../../types';
import { getStorageRequests, updateRequestStatus, deleteStorageUser, deleteRegistrationRequest } from '../../utils/storage';
import { Trash2 } from 'lucide-react';

export default function AdminView() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, Role>>({});

  const loadRequests = () => {
    const all = getStorageRequests();
    all.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return b.createdAt - a.createdAt;
    });
    setRequests(all);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    const role = selectedRoles[id] || 'user';
    updateRequestStatus(id, status, role);
    loadRequests();
  };

  const handleRoleChange = (id: string, role: Role) => {
    setSelectedRoles(prev => ({ ...prev, [id]: role }));
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      deleteStorageUser(id);
      deleteRegistrationRequest(id);
      loadRequests();
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="col-span-4 bg-slate-800/80 text-white border border-slate-700/50 shadow-sm">
      <div className="p-4 border-b border-slate-700/30 flex justify-between items-center bg-slate-900/50">
        <span className="text-xs font-bold uppercase text-slate-300 tracking-wide">Очередь запросов на регистрацию</span>
        <span className="text-[10px] text-slate-400 italic">Ожидают: {pendingCount}</span>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-800/80 text-white text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700/30">
            <th className="px-6 py-3">Логин</th>
            <th className="px-6 py-3">Дата запроса</th>
            <th className="px-6 py-3">Статус</th>
            <th className="px-6 py-3 text-right">Действия</th>
          </tr>
        </thead>
        <tbody className="text-xs text-slate-300">
          {requests.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Нет заявок</td>
            </tr>
          ) : (
            requests.map(req => (
              <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-900/50">
                <td className="px-6 py-4 font-bold">{req.login}</td>
                <td className="px-6 py-4">{new Date(req.createdAt).toLocaleString('ru-RU')}</td>
                <td className="px-6 py-4">
                  {req.status === 'pending' && <span className="bg-blue-50 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-bold">ОЖИДАЕТ</span>}
                  {req.status === 'approved' && <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold">ОДОБРЕНО</span>}
                  {req.status === 'rejected' && <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded text-[10px] font-bold">ОТКЛОНЕНО</span>}
                </td>
                <td className="px-6 py-4 text-right flex justify-end items-center gap-2">
                  {req.status === 'pending' ? (
                    <>
                      <select 
                        value={selectedRoles[req.id] || 'user'}
                        onChange={(e) => handleRoleChange(req.id, e.target.value as Role)}
                        className="text-[10px] border border-slate-700/50 rounded px-2 py-1 outline-none bg-slate-900/50 font-bold text-slate-300 focus:border-blue-500"
                      >
                        <option value="user">ОБЫЧНЫЙ</option>
                        <option value="admin">АДМИН</option>
                      </select>
                      <button
                        onClick={() => handleAction(req.id, 'approved')}
                        className="bg-emerald-500 text-white px-3 py-1 rounded text-[10px] font-bold hover:bg-emerald-600"
                      >
                        ОДОБРИТЬ
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'rejected')}
                        className="bg-rose-500 text-white px-3 py-1 rounded text-[10px] font-bold hover:bg-rose-600"
                      >
                        ОТКЛОНИТЬ
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDelete(req.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Удалить пользователя/заявку"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
