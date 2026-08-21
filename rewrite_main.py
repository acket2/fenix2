import re

with open('src/components/views/MainView.tsx', 'r') as f:
    content = f.read()

# 1. We replace the top stats grid. 
# We don't need the stats from storage anymore. We compute them directly.
# Let's extract the stats block.

stats_block_pattern = re.compile(r'\{\/\* СТАТИСТИКА \*\/.*?\{\/\* АКТИВНЫЕ СТРОЙКИ \*\/\}', re.DOTALL)

# Compute values
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
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col justify-center bg-gradient-to-br from-emerald-900/20 to-slate-800/80 border-emerald-500/20">
          <div className="text-xs text-emerald-400/80 font-bold uppercase mb-1">Чистая прибыль</div>
          <div className="text-2xl font-bold text-emerald-400">{objects.reduce((sum, o) => sum + ((o.closingAmount || 0) - (o.costAmount || 0)), 0).toLocaleString('ru-RU')} ₽</div>
        </div>
      </div>

      {/* АКТИВНЫЕ СТРОЙКИ */}"""

content = re.sub(stats_block_pattern, computed_stats_tsx, content)

# 2. Add input for completed objects
old_completed_header = """      {/* ЗАВЕРШЕННЫЕ ОБЪЕКТЫ */}
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
          <div className="p-5 space-y-3 overflow-y-auto max-h-[400px] custom-scrollbar">"""

new_completed_header = """      {/* ЗАВЕРШЕННЫЕ ОБЪЕКТЫ */}
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
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newCompletedName}
                  onChange={(e) => setNewCompletedName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddCompleted(); }}
                  placeholder="Вписать название завершенной стройки..."
                  className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500/50 outline-none transition-colors placeholder-slate-500"
                />
                <button
                  onClick={handleAddCompleted}
                  disabled={!newCompletedName.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Добавить
                </button>
              </div>
            )}
            <div className="space-y-3 overflow-y-auto max-h-[400px] custom-scrollbar pb-4">"""

content = content.replace(old_completed_header, new_completed_header)

# Replace the mapping of completed objects to use ActiveObjectCard
old_completed_map = """            {completedObjects.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-8">Нет завершенных строек</div>
            ) : (
              completedObjects.map((obj, index) => (
                <div key={obj.id} className="flex items-center gap-4 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center rounded-xl font-bold text-emerald-400 shrink-0">
                    #{String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-300 line-through truncate mb-1">{obj.name}</div>
                    <div className="text-xs text-emerald-500/80 flex items-center gap-1">
                      Сдан заказчику: <span className="text-emerald-400 font-medium truncate">{obj.customer}</span>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">100%</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>"""

new_completed_map = """            {completedObjects.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-8">Нет завершенных строек</div>
            ) : (
              completedObjects.map((obj, index) => (
                <ActiveObjectCard key={obj.id} obj={obj} index={index} user={user} />
              ))
            )}
            </div>
          </div>
        )}
      </div>"""

content = content.replace(old_completed_map, new_completed_map)

# Add states and handlers for newCompletedName
state_injection = """  const [newObjectName, setNewObjectName] = useState('');
  const [newCompletedName, setNewCompletedName] = useState('');"""

content = content.replace("  const [newObjectName, setNewObjectName] = useState('');", state_injection)

handlers_injection = """  const handleAddObject = () => {
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
    
    const currentObjects = getTableObjects();
    localStorage.setItem('phoenix_objects', JSON.stringify([...currentObjects, newObj]));
    window.dispatchEvent(new Event('app-storage-changed'));
    setNewObjectName('');
    loadData();
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
    
    const currentObjects = getTableObjects();
    localStorage.setItem('phoenix_objects', JSON.stringify([...currentObjects, newObj]));
    window.dispatchEvent(new Event('app-storage-changed'));
    setNewCompletedName('');
    loadData();
  };"""

content = re.sub(r'  const handleAddObject = \(\) => \{.*?\n  \};\n', handlers_injection, content, flags=re.DOTALL)


with open('src/components/views/MainView.tsx', 'w') as f:
    f.write(content)
