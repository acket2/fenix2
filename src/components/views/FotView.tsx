import React, { useState, useEffect } from 'react';
import { User, FotRecord, DayStatus } from '../../types';
import { getFotRecords, updateFotRecord } from '../../utils/storage';
import { ChevronLeft, ChevronRight, Plus, Trash2, X, Calendar as CalendarIcon, Gift } from 'lucide-react';

interface FotViewProps {
  user: User;
}

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const DEFAULT_RATE = 2000;


const DebouncedInput = ({ value, onChange, className, type = "text", placeholder = "", style = {} }: { value: any, onChange: (val: any) => void, className?: string, type?: string, placeholder?: string, style?: any }) => {
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };



  return (
    <input
      type={type}
      value={localValue}
      onChange={(e: any) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e: any) => {
        if (e.key === 'Enter') e.target.blur();
      }}
      className={className}
      placeholder={placeholder}
      style={style}
    />
  );
};

export default function FotView({ user }: FotViewProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [records, setRecords] = useState<FotRecord[]>([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dayModal, setDayModal] = useState<{
    isOpen: boolean;
    record: FotRecord | null;
    day: number;
    currentStatus: DayStatus;
    currentAmount: number;
  }>({ isOpen: false, record: null, day: 0, currentStatus: 'none', currentAmount: 0 });

  const loadData = () => {
    const all = getFotRecords();
    let current = all.filter(r => r.year === currentYear && r.month === currentMonth);
    
    // Если записей нет и это админ, создаем 10 пустых строк
    if (current.length === 0 && user.role === 'admin') {
      const initialRecords: FotRecord[] = Array.from({ length: 10 }).map((_, i) => ({
        id: Date.now().toString() + i,
        workerName: `Работник ${i + 1}`,
        year: currentYear,
        month: currentMonth,
        days: {},
        paidFridays: {},
        paidAmount: 0,
        bonusAmount: 0,
        dailyRate: DEFAULT_RATE,
        isBonusPaid: false
      }));
      initialRecords.forEach(r => updateFotRecord(r));
      current = initialRecords;
    }
    setRecords(current);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('app-storage-changed', loadData);
    return () => window.removeEventListener('app-storage-changed', loadData);
  }, [currentYear, currentMonth]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayOfWeek = (day: number) => {
    return new Date(currentYear, currentMonth, day).getDay(); // 0 is Sunday, 5 is Friday
  };

  const handleDayClick = (record: FotRecord, day: number) => {
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

  const handlePaidFridayToggle = (record: FotRecord, day: number) => {
    if (user.role !== 'admin') return;
    const isPaid = (record.paidFridays || {})[day] || false;
    
    // Считаем заработок с прошлой субботы до этой пятницы (за 7 дней)
    let weekEarned = 0;
    const rate = record.dailyRate || DEFAULT_RATE;
    for (let i = day - 6; i <= day; i++) {
      if (i > 0) {
        const status = (record.days || {})[i];
        if (status === 'full') weekEarned += rate;
        if (status === 'half') weekEarned += rate / 2;
      }
    }

    const newPaidAmount = isPaid 
      ? Math.max(0, (record.paidAmount || 0) - weekEarned) // Снимаем галочку - уменьшаем выданное
      : (record.paidAmount || 0) + weekEarned;             // Ставим галочку - прибавляем выданное

    const updated = { 
      ...record, 
      paidFridays: { ...(record.paidFridays || {}), [day]: !isPaid },
      paidAmount: newPaidAmount
    };
    
    updateFotRecord(updated);
    loadData();
  };

  const handleNameChange = (record: FotRecord, newName: string) => {
    updateFotRecord({ ...record, workerName: newName });
    loadData();
  };

  const calculateBaseEarned = (record: FotRecord) => {
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
  };

  const handlePaidChange = (record: FotRecord, amount: number) => {
    updateFotRecord({ ...record, paidAmount: amount });
    loadData();
  };

  const handleRateChange = (record: FotRecord, newRate: number) => {
    updateFotRecord({ ...record, dailyRate: newRate });
    loadData();
  };

  const handleBonusClick = (record: FotRecord) => {
    if (user.role !== 'admin') return;
    const oldBonus = record.bonusAmount || 0;
    const amountStr = window.prompt(`Введите сумму премии для "${record.workerName}" (₽):`, oldBonus.toString());
    if (amountStr !== null) {
      const amount = parseInt(amountStr, 10) || 0;
      let newPaid = record.paidAmount || 0;
      if (record.isBonusPaid) {
        newPaid = newPaid - oldBonus + amount;
      }
      updateFotRecord({ ...record, bonusAmount: amount, paidAmount: newPaid });
      loadData();
    }
  };

  const handleBonusPaidToggle = (record: FotRecord) => {
    if (user.role !== 'admin') return;
    const isPaid = record.isBonusPaid || false;
    const amount = record.bonusAmount || 0;
    
    const newPaidAmount = isPaid 
      ? Math.max(0, (record.paidAmount || 0) - amount)
      : (record.paidAmount || 0) + amount;

    updateFotRecord({ 
      ...record, 
      isBonusPaid: !isPaid,
      paidAmount: newPaidAmount
    });
    loadData();
  };

  const addRow = () => {
    const newRecord: FotRecord = {
      id: Date.now().toString(),
      workerName: 'Новый работник',
      year: currentYear,
      month: currentMonth,
      days: {},
      paidFridays: {},
      paidAmount: 0,
      bonusAmount: 0,
      dailyRate: DEFAULT_RATE,
      isBonusPaid: false
    };
    updateFotRecord(newRecord);
    loadData();
  };

  const totalPaidOut = records.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
  const totalBonuses = records.reduce((sum, r) => sum + (r.bonusAmount || 0), 0);
  const totalUnpaid = records.reduce((sum, r) => sum + (calculateBaseEarned(r) + (r.bonusAmount || 0) - (r.paidAmount || 0)), 0);

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full">

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

      <div className="bg-slate-800/80 text-white border border-slate-700/50 shadow-sm p-4 min-w-0 overflow-hidden">
        
        {/* Календарь / Навигация */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wide">ФОНД ОПЛАТЫ ТРУДА</h3>
          <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-700/50 p-1 rounded relative">
            <button 
              onClick={() => {
                if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
                else setCurrentMonth(m => m - 1);
              }} 
              className="p-1 hover:bg-slate-800/80 text-white rounded border border-transparent hover:border-slate-700/50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="text-sm font-bold text-white uppercase w-32 text-center hover:text-cyan-400 transition-colors flex items-center justify-center gap-2"
            >
              {MONTHS[currentMonth]} {currentYear}
            </button>
            <button 
              onClick={() => {
                if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
                else setCurrentMonth(m => m + 1);
              }} 
              className="p-1 hover:bg-slate-800/80 text-white rounded border border-transparent hover:border-slate-700/50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Выпадающее меню выбора даты */}
            {isDatePickerOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-slate-800/80 text-white border border-slate-700/50 shadow-lg rounded-lg p-4 z-50 w-64">
                <div className="flex items-center justify-between mb-4 border-b border-slate-700/30 pb-2">
                  <button onClick={() => setCurrentYear(y => y - 1)} className="p-1 hover:bg-slate-900/50 rounded"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="font-bold text-white">{currentYear}</span>
                  <button onClick={() => setCurrentYear(y => y + 1)} className="p-1 hover:bg-slate-900/50 rounded"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {MONTHS.map((month, idx) => (
                    <button
                      key={month}
                      onClick={() => {
                        setCurrentMonth(idx);
                        setIsDatePickerOpen(false);
                      }}
                      className={`p-2 text-[10px] font-bold uppercase rounded transition-colors ${idx === currentMonth ? 'bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-500/50 text-white text-white' : 'hover:bg-slate-700/50 text-slate-300'}`}
                    >
                      {month.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Таблица */}
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse" style={{ minWidth: `${300 + daysInMonth * 40}px` }}>
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700/50">
                <th className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-900/50 z-20 border-r border-slate-700/50" style={{ minWidth: '160px', maxWidth: '160px' }}>Сотрудник</th>
                {daysArray.map(day => (
                  <th key={day} className={`p-1 text-center text-[10px] font-bold border-r border-slate-700/30 w-10 ${getDayOfWeek(day) === 5 ? 'bg-blue-50 text-blue-700' : 'text-slate-400'}`}>
                    {day}
                    {getDayOfWeek(day) === 5 && <div className="text-[8px] text-blue-400 mt-1">ПТ</div>}
                  </th>
                ))}
                <th className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right w-24">Премия (₽)</th>
                <th className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right w-24">Всего (₽)</th>
                <th className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right w-24">Выдано (₽)</th>
                <th className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right w-24">Невыдано (₽)</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const baseEarned = calculateBaseEarned(record);
                const totalEarned = baseEarned + (record.bonusAmount || 0);
                const owed = totalEarned - record.paidAmount;
                return (
                  <tr key={record.id} className="border-b border-slate-700/30 hover:bg-slate-900/50 transition-colors">
                    <td className="p-2 sm:sticky sm:left-0 bg-slate-800 text-white group-hover:bg-slate-900/50 border-r border-slate-700/50 sm:z-10" style={{ minWidth: '160px', maxWidth: '160px' }}>
                      {user.role === 'admin' ? (
                        <DebouncedInput 
                          value={record.workerName} 
                          onChange={(val) => handleNameChange(record, val)}
                          className="w-full text-xs font-bold text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none"
                        />
                      ) : (
                        <span className="text-xs font-bold text-white block w-full truncate">{record.workerName}</span>
                      )}
                    </td>
                    {daysArray.map(day => {
                      const isFriday = getDayOfWeek(day) === 5;
                      const status = (record.days || {})[day] || 'none';
                      const isPaid = (record.paidFridays || {})[day] || false;
                      
                      return (
                        <td key={day} className={`p-1 border-r border-slate-700/30 text-center relative ${isFriday ? 'bg-blue-50/30' : ''}`}>
                          <button 
                            onClick={() => handleDayClick(record, day)}
                            disabled={user.role !== 'admin'}
                            className="w-full h-8 flex flex-col items-center justify-center gap-1 hover:bg-slate-700/50 rounded"
                          >
                            {status === 'full' && <div className="w-3 h-3 rounded-full bg-emerald-500/100 shadow-sm" title="Полный день" />}
                            {status === 'half' && <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" title="Пол дня" />}
                            {status === 'absent' && <div className="w-3 h-3 rounded-full bg-red-500/100 shadow-sm flex items-center justify-center"><X className="w-2 h-2 text-white" /></div>}
                            {status === 'none' && <div className="w-3 h-3 rounded-full border border-slate-700/50" />}
                          </button>
                          
                          {/* Пятничная галочка - ЗП */}
                          {isFriday && user.role === 'admin' && (
                            <button 
                              onClick={() => handlePaidFridayToggle(record, day)}
                              title={isPaid ? "ЗП за неделю выдана" : "Отметить выплату"}
                              className={`absolute bottom-0 right-0 w-3 h-3 m-0.5 rounded flex items-center justify-center border text-[8px] font-bold ${isPaid ? 'bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-500/50 text-white border-blue-600 text-white' : 'bg-slate-800/80 text-white border-blue-200 text-transparent hover:border-blue-500'}`}
                            >
                              ✓
                            </button>
                          )}
                          {isFriday && user.role !== 'admin' && isPaid && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 m-0.5 rounded flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-500/50 text-white text-white text-[8px] font-bold">✓</div>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-2 text-right relative group">
                      <div className="flex justify-end items-center gap-2">
                        {user.role === 'admin' ? (
                          <button 
                            onClick={() => handleBonusClick(record)}
                            className={`flex items-center gap-1 text-xs font-bold hover:opacity-80 transition-opacity ${record.bonusAmount ? 'text-amber-600' : 'text-slate-300'}`}
                          >
                            <Gift className="w-3 h-3" />
                            {record.bonusAmount ? record.bonusAmount.toLocaleString('ru-RU') : '0'}
                          </button>
                        ) : (
                          <span className={`text-xs font-bold flex items-center gap-1 ${record.bonusAmount ? 'text-amber-600' : 'text-slate-400'}`}>
                             <Gift className="w-3 h-3" />
                             {record.bonusAmount ? record.bonusAmount.toLocaleString('ru-RU') : '0'}
                          </span>
                        )}
                        
                        {(record.bonusAmount || 0) > 0 && user.role === 'admin' && (
                          <button 
                            onClick={() => handleBonusPaidToggle(record)}
                            title={record.isBonusPaid ? "Премия выплачена" : "Отметить выплату премии"}
                            className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] font-bold transition-colors ${record.isBonusPaid ? 'bg-amber-500/100 border-amber-500 text-white' : 'bg-slate-800/80 text-white border-amber-500/20 text-transparent hover:border-amber-500'}`}
                          >
                            ✓
                          </button>
                        )}
                        {(record.bonusAmount || 0) > 0 && user.role !== 'admin' && record.isBonusPaid && (
                          <div className="w-4 h-4 rounded flex items-center justify-center bg-amber-500/100 text-white text-[10px] font-bold">✓</div>
                        )}
                      </div>
                    </td>
                    <td className="p-2 text-right font-bold text-white text-xs">
                      {totalEarned.toLocaleString('ru-RU')}
                    </td>
                    <td className="p-2 text-right">
                      {user.role === 'admin' ? (
                        <DebouncedInput 
                          type="number"
                          value={record.paidAmount || ''}
                          onChange={(val) => handlePaidChange(record, parseInt(val) || 0)}
                          className="w-full text-right text-xs font-bold text-cyan-400 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none"
                          placeholder="0"
                        />
                      ) : (
                        <span className="text-xs font-bold text-cyan-400 block w-full">{record.paidAmount.toLocaleString('ru-RU')}</span>
                      )}
                    </td>
                    <td className="p-2 text-right">
                      {user.role === 'admin' ? (
                        <DebouncedInput 
                          type="number"
                          value={owed || ''}
                          onChange={(val) => {
                            const newOwed = parseInt(val) || 0;
                            handlePaidChange(record, totalEarned - newOwed);
                          }}
                          className="w-full text-right text-xs font-bold text-red-400 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-red-500 outline-none"
                          placeholder="0"
                        />
                      ) : (
                        <span className="text-xs font-bold text-red-400 block w-full">{owed > 0 ? owed.toLocaleString('ru-RU') : 0}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Подвал таблицы */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-700/50 pt-4 px-2 overflow-x-auto gap-4">
          {user.role === 'admin' && (
            <button onClick={addRow} className="flex-shrink-0 flex items-center gap-2 text-[11px] font-bold uppercase text-cyan-400 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded">
              <Plus className="w-3 h-3" /> Добавить работника
            </button>
          )}
          
          <div className="flex items-center gap-6 ml-auto flex-shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Общая премия</div>
              <div className="text-lg font-black text-amber-600">{totalBonuses.toLocaleString('ru-RU')} ₽</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Общая невыплата</div>
              <div className="text-lg font-black text-red-400">{totalUnpaid.toLocaleString('ru-RU')} ₽</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Общая сумма выплат</div>
              <div className="text-lg font-black text-cyan-400">{totalPaidOut.toLocaleString('ru-RU')} ₽</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-[10px] text-slate-400 font-medium">
          * Нажимайте на кружок в ячейке дня для выбора статуса и суммы. При выборе "Работал" или "Полдня" укажите точную сумму заработка за день (по умолчанию подставляется {DEFAULT_RATE} ₽).<br/>
          * Пятницы выделены синим цветом, в углу ячейки есть маленькая галочка для отметки факта еженедельной выплаты.
        </div>
      </div>
    </div>
  );
}
