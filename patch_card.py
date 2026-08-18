import re

with open('src/components/views/ActiveObjectCard.tsx', 'r') as f:
    content = f.read()

# Add closingAmount to edit form
old_edit_grid = """            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Бюджет (₽)</span>
                <input type="number" value={editForm.contractAmount} onChange={e => setEditForm({...editForm, contractAmount: parseInt(e.target.value) || 0})} className="w-full text-sm border border-slate-700/50 rounded px-2 py-1 outline-none bg-slate-800 text-white" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">Затраты (₽)</span>
                <input type="number" value={editForm.costAmount} onChange={e => setEditForm({...editForm, costAmount: parseInt(e.target.value) || 0})} className="w-full text-sm border border-slate-700/50 rounded px-2 py-1 outline-none bg-slate-800 text-white" />
              </div>
            </div>"""

new_edit_grid = """            <div className="grid grid-cols-3 gap-2">
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
            </div>"""

content = content.replace(old_edit_grid, new_edit_grid)

# Add closingAmount to view
old_view_grid = """            {user.role === 'admin' ? (
              <div className="grid grid-cols-3 gap-2 bg-slate-900/30 p-2 rounded-lg border border-slate-700/30 text-xs">
                <div>
                  <div className="text-slate-500 mb-0.5">Бюджет</div>
                  <div className="font-semibold text-white">{obj.contractAmount?.toLocaleString('ru-RU')} ₽</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-0.5">Потрачено</div>
                  <div className="font-semibold text-slate-300">{obj.costAmount?.toLocaleString('ru-RU')} ₽</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-0.5">Остаток</div>
                  <div className={`font-semibold ${isLoss ? 'text-red-400' : 'text-emerald-400'}`}>
                    {remaining?.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>
            ) : null}"""

new_view_grid = """            {user.role === 'admin' ? (
              <div className="grid grid-cols-4 gap-2 bg-slate-900/30 p-2 rounded-lg border border-slate-700/30 text-xs">
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
                  <div className={`font-semibold ${((obj.closingAmount || 0) - (obj.costAmount || 0)) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {((obj.closingAmount || 0) - (obj.costAmount || 0)).toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>
            ) : null}"""

content = content.replace(old_view_grid, new_view_grid)

# Auto-move on save if progress == 100
content = content.replace(
    """  const handleSave = () => {
    updateTableObject(editForm);
    setIsEditing(false);
  };""",
    """  const handleSave = () => {
    const isCompleted = editForm.progress === 100 ? true : editForm.isCompleted;
    const finalForm = { ...editForm, isCompleted };
    updateTableObject(finalForm);
    setIsEditing(false);
  };"""
)

with open('src/components/views/ActiveObjectCard.tsx', 'w') as f:
    f.write(content)
