import re

with open('src/components/views/FotView.tsx', 'r') as f:
    content = f.read()

# Add dayModal state
state_injection = """  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dayModal, setDayModal] = useState<{
    isOpen: boolean;
    record: FotRecord | null;
    day: number;
    currentStatus: DayStatus;
    currentAmount: number;
  }>({ isOpen: false, record: null, day: 0, currentStatus: 'none', currentAmount: 0 });
"""
content = re.sub(r'  const \[isDatePickerOpen, setIsDatePickerOpen\] = useState\(false\);\n', state_injection, content)

# Replace handleDayClick
handle_day_click_new = """  const handleDayClick = (record: FotRecord, day: number) => {
    if (user.role !== 'admin') return;
    const currentStatus = (record.days || {})[day] || 'none';
    const currentAmount = (record.dayAmounts || {})[day] || record.dailyRate || DEFAULT_RATE;
    setDayModal({ isOpen: true, record, day, currentStatus, currentAmount });
  };
  
  const handleSaveDayModal = () => {
    if (!dayModal.record) return;
    const { record, day, currentStatus, currentAmount } = dayModal;
    const updated = { 
      ...record, 
      days: { ...(record.days || {}), [day]: currentStatus },
      dayAmounts: { ...(record.dayAmounts || {}), [day]: currentAmount }
    };
    updateFotRecord(updated);
    loadData();
    setDayModal({ isOpen: false, record: null, day: 0, currentStatus: 'none', currentAmount: 0 });
  };
"""
content = re.sub(r'  const handleDayClick = \(record: FotRecord, day: number\) => \{[\s\S]*?loadData\(\);\n  \};\n', handle_day_click_new, content)

# Replace calculateBaseEarned
calc_earned_new = """  const calculateBaseEarned = (record: FotRecord) => {
    let total = 0;
    const rate = record.dailyRate || DEFAULT_RATE;
    Object.keys(record.days || {}).forEach(dayStr => {
      const day = parseInt(dayStr);
      const status = record.days[day];
      const dayRate = (record.dayAmounts && record.dayAmounts[day] !== undefined) ? record.dayAmounts[day] : rate;
      if (status === 'full') total += dayRate;
      if (status === 'half') total += dayRate; // Changed to use entered amount rather than strictly half
    });
    return total;
  };"""
content = re.sub(r'  const calculateBaseEarned = \(record: FotRecord\) => \{[\s\S]*?  \};\n', calc_earned_new + '\n', content)

# Remove the Ставка header
content = re.sub(r'                <th className="p-1 text-\[10px\] font-bold text-slate-400 uppercase tracking-wider sticky bg-slate-900/50 z-20 border-r border-slate-700/50 text-center" style={{ left: \'160px\', minWidth: \'70px\', maxWidth: \'70px\' }}>Ставка</th>\n', '', content)

# Adjust header's days left sticky position if needed? Wait, the days are NOT sticky. "Ставка" was sticky at left: 160px.
# But "Сотрудник" is sticky at left: 0, minWidth 160px.

# Remove the Ставка cell
cell_pattern = r'                    <td className="p-1 sm:sticky bg-slate-800 text-white group-hover:bg-slate-900/50 border-r border-slate-700/50 sm:z-10 text-center" style=\{\{ left: \'160px\', minWidth: \'70px\', maxWidth: \'70px\' \}\}>\s*\{user\.role === \'admin\' \? \(\s*<DebouncedInput\s*type="number"\s*value=\{record\.dailyRate \|\| DEFAULT_RATE\}\s*onChange=\{\(val\) => handleRateChange\(record, parseInt\(val\) \|\| 0\)\}\s*className="w-full text-center text-xs font-bold text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none"\s*style=\{\{ appearance: \'textfield\', WebkitAppearance: \'textfield\', MozAppearance: \'textfield\' \}\}\s*\/>\s*\) : \(\s*<span className="text-xs font-bold text-white block w-full text-center">\{record\.dailyRate \|\| DEFAULT_RATE\}<\/span>\s*\)\}\s*<\/td>\n'
content = re.sub(cell_pattern, '', content)

# Inject the modal JSX
modal_jsx = """
      {dayModal.isOpen && dayModal.record && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
              <span>Отработанный день {dayModal.day}</span>
              <button onClick={() => setDayModal({ isOpen: false, record: null, day: 0, currentStatus: 'none', currentAmount: 0 })} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Статус дня</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setDayModal({...dayModal, currentStatus: 'full'})} 
                    className={`p-2 rounded-xl border text-sm font-bold transition-colors ${dayModal.currentStatus === 'full' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                  >
                    Работал
                  </button>
                  <button 
                    onClick={() => setDayModal({...dayModal, currentStatus: 'half'})} 
                    className={`p-2 rounded-xl border text-sm font-bold transition-colors ${dayModal.currentStatus === 'half' ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                  >
                    Полдня
                  </button>
                  <button 
                    onClick={() => setDayModal({...dayModal, currentStatus: 'absent'})} 
                    className={`p-2 rounded-xl border text-sm font-bold transition-colors ${dayModal.currentStatus === 'absent' ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                  >
                    Прогул
                  </button>
                  <button 
                    onClick={() => setDayModal({...dayModal, currentStatus: 'none'})} 
                    className={`p-2 rounded-xl border text-sm font-bold transition-colors ${dayModal.currentStatus === 'none' ? 'bg-slate-700 border-slate-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                  >
                    Очистить
                  </button>
                </div>
              </div>
              
              {(dayModal.currentStatus === 'full' || dayModal.currentStatus === 'half') && (
                <div className="pt-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Ставка за этот день (₽)</label>
                  <input 
                    type="number" 
                    value={dayModal.currentAmount}
                    onChange={(e) => setDayModal({...dayModal, currentAmount: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-cyan-500 text-lg font-black"
                  />
                  <p className="text-[10px] text-slate-500 mt-2">Укажите точную сумму заработка за этот день, учитывая переработки или недоработки.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700">
              <button 
                onClick={() => handleSaveDayModal()}
                className="w-full py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 transition-colors font-bold uppercase tracking-wider text-sm shadow-lg shadow-cyan-900/20"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
"""
content = re.sub(r'(    <div className="space-y-6 w-full min-w-0 max-w-full">)', r'\1\n' + modal_jsx, content)

# Fix the info text at the bottom
content = content.replace(
    '* Базовая ставка по умолчанию составляет {DEFAULT_RATE} ₽. Вы можете изменять ставку индивидуально для каждого сотрудника в колонке "Ставка". Нажимайте на кружок в ячейке дня для смены статуса: пустой → полный (зеленый) → полдня (оранжевый) → пропуск (красный крест).<br/>',
    '* Нажимайте на кружок в ячейке дня для выбора статуса и суммы. При выборе "Работал" или "Полдня" укажите точную сумму заработка за день (по умолчанию подставляется {DEFAULT_RATE} ₽).<br/>'
)

with open('src/components/views/FotView.tsx', 'w') as f:
    f.write(content)
