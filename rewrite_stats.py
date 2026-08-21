import re

with open('src/components/views/MainView.tsx', 'r') as f:
    content = f.read()

start_marker = "{/* СТАТИСТИКА */}"
end_marker = "{/* АКТИВНЫЕ ОБЪЕКТЫ */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    before = content[:start_idx]
    after = content[end_idx:]
    
    computed_stats_tsx = """{/* СТАТИСТИКА */}
      <div className="col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 w-full mb-2">
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
                  <div className="text-2xl font-black text-white">{displayContract.toLocaleString('ru-RU')} <span className="text-slate-500 text-lg">₽</span></div>
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
                  <div className="text-2xl font-black text-white">{displayClosing.toLocaleString('ru-RU')} <span className="text-slate-500 text-lg">₽</span></div>
                )}
              </div>

              {/* ЧИСТАЯ ПРИБЫЛЬ */}
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-emerald-500/30 shadow-xl flex flex-col justify-center bg-gradient-to-br from-emerald-900/40 to-slate-800/80 relative overflow-hidden group">
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
                  <div className="text-2xl font-black text-emerald-400 relative z-10">{displayProfit.toLocaleString('ru-RU')} <span className="text-emerald-500/50 text-lg">₽</span></div>
                )}
              </div>
            </>
          );
        })()}
      </div>

      """
      
    new_content = before + computed_stats_tsx + after
    with open('src/components/views/MainView.tsx', 'w') as f:
        f.write(new_content)
    print("SUCCESS")
else:
    print("COULD NOT FIND MARKERS", start_idx, end_idx)
