import re

with open('src/components/views/MainView.tsx', 'r') as f:
    content = f.read()

# I will find the exact block to replace
start_marker = "{/* СТАТИСТИКА */}"
end_marker = "{/* АКТИВНЫЕ СТРОЙКИ */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    before = content[:start_idx]
    after = content[end_idx:]
    
    computed_stats_tsx = """{/* СТАТИСТИКА */}
      <div className="col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-2">
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col justify-center">
          <div className="text-xs text-slate-400 font-bold uppercase mb-1">Активные стройки</div>
          <div className="text-2xl font-bold text-white">{activeObjects.length}</div>
        </div>
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col justify-center">
          <div className="text-xs text-slate-400 font-bold uppercase mb-1">Завершенные</div>
          <div className="text-2xl font-bold text-white">{completedObjects.length}</div>
        </div>
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col justify-center">
          <div className="text-xs text-slate-400 font-bold uppercase mb-1">Сумма контрактов</div>
          <div className="text-2xl font-bold text-white">{objects.reduce((sum, o) => sum + (o.contractAmount || 0), 0).toLocaleString('ru-RU')} ₽</div>
        </div>
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col justify-center">
          <div className="text-xs text-slate-400 font-bold uppercase mb-1">Сумма закрытия</div>
          <div className="text-2xl font-bold text-white">{objects.reduce((sum, o) => sum + (o.closingAmount || 0), 0).toLocaleString('ru-RU')} ₽</div>
        </div>
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-emerald-500/30 shadow-xl flex flex-col justify-center bg-gradient-to-br from-emerald-900/40 to-slate-800/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="text-xs text-emerald-400 font-bold uppercase mb-1 relative z-10">Чистая прибыль</div>
          <div className="text-2xl font-bold text-emerald-400 relative z-10">{objects.reduce((sum, o) => sum + ((o.closingAmount || 0) - (o.costAmount || 0)), 0).toLocaleString('ru-RU')} ₽</div>
        </div>
      </div>

      """
      
    new_content = before + computed_stats_tsx + after
    with open('src/components/views/MainView.tsx', 'w') as f:
        f.write(new_content)
    print("SUCCESS")
else:
    print("COULD NOT FIND MARKERS")
