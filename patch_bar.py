with open('src/components/views/ActiveObjectCard.tsx', 'r') as f:
    content = f.read()

replacement = """  const remaining = obj.contractAmount - obj.costAmount;
  const isLoss = remaining < 0;

  // Рассчет перерасхода
  const physicalProgress = obj.progress || 0;
  const budgetProgress = obj.contractAmount ? Math.min(100, Math.round((obj.costAmount / obj.contractAmount) * 100)) : 0;
  const isOverbudget = budgetProgress > physicalProgress;
  
  const barColor = isOverbudget 
    ? 'bg-gradient-to-r from-red-500 to-rose-500' // Красный если перерасход
    : (obj.color || 'bg-gradient-to-r from-blue-500 to-cyan-500');"""

content = content.replace("  const remaining = obj.contractAmount - obj.costAmount;\n  const isLoss = remaining < 0;", replacement)

# Replace the bar div
bar_search = """            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700/50">
                <div className={`${obj.color || 'bg-gradient-to-r from-blue-500 to-cyan-500'} h-full transition-all duration-500`} style={{ width: `${obj.progress || 0}%` }}></div>
              </div>
              <div className="text-xs font-bold text-cyan-400 min-w-[32px] text-right">{obj.progress || 0}%</div>
            </div>"""

bar_replacement = """            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700/50">
                <div className={`${barColor} h-full transition-all duration-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]`} style={{ width: `${physicalProgress}%` }}></div>
              </div>
              <div className={`text-xs font-bold min-w-[32px] text-right ${isOverbudget ? 'text-red-400' : 'text-cyan-400'}`}>{physicalProgress}%</div>
            </div>"""

content = content.replace(bar_search, bar_replacement)

with open('src/components/views/ActiveObjectCard.tsx', 'w') as f:
    f.write(content)
