import re

# Fix MainView.tsx
with open('src/components/views/MainView.tsx', 'r') as f:
    content = f.read()

# Make the numbers smaller on narrow screens and prevent wrapping of the Ruble sign
content = content.replace(
    '<div className="text-2xl font-black text-white">{displayContract.toLocaleString(\'ru-RU\')} <span className="text-slate-500 text-lg">₽</span></div>',
    '<div className="text-xl 2xl:text-2xl font-black text-white flex items-baseline gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">{displayContract.toLocaleString(\'ru-RU\')} <span className="text-slate-500 text-sm 2xl:text-lg">₽</span></div>'
)
content = content.replace(
    '<div className="text-2xl font-black text-white">{displayClosing.toLocaleString(\'ru-RU\')} <span className="text-slate-500 text-lg">₽</span></div>',
    '<div className="text-xl 2xl:text-2xl font-black text-white flex items-baseline gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">{displayClosing.toLocaleString(\'ru-RU\')} <span className="text-slate-500 text-sm 2xl:text-lg">₽</span></div>'
)
content = content.replace(
    '<div className="text-2xl font-black text-emerald-400 relative z-10">{displayProfit.toLocaleString(\'ru-RU\')} <span className="text-emerald-500/50 text-lg">₽</span></div>',
    '<div className="text-xl 2xl:text-2xl font-black text-emerald-400 relative z-10 flex items-baseline gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">{displayProfit.toLocaleString(\'ru-RU\')} <span className="text-emerald-500/50 text-sm 2xl:text-lg">₽</span></div>'
)

# Also fix the grid layout slightly for the top cards to give them more space if needed
content = content.replace(
    '<div className="col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 w-full mb-2">',
    '<div className="col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-4 grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 w-full mb-2">'
)
# Make the active/completed cards span 1 col on mobile so it's a 2x... grid
# Wait, let's keep it responsive

with open('src/components/views/MainView.tsx', 'w') as f:
    f.write(content)

# Fix ActiveObjectCard.tsx
with open('src/components/views/ActiveObjectCard.tsx', 'r') as f:
    content = f.read()

# Change the 4-column layout to a 2x2 grid to give numbers more space
content = content.replace(
    '<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 bg-slate-900/30 p-3 sm:p-2 rounded-lg border border-slate-700/30 text-xs">',
    '<div className="grid grid-cols-2 gap-y-3 gap-x-2 bg-slate-900/30 p-3 rounded-lg border border-slate-700/30 text-xs">'
)

# Ensure numbers don't wrap and have nice formatting
content = content.replace(
    '<div className="font-semibold text-white">{obj.contractAmount?.toLocaleString(\'ru-RU\')} ₽</div>',
    '<div className="font-semibold text-white flex items-baseline gap-1 whitespace-nowrap overflow-hidden text-ellipsis">{obj.contractAmount?.toLocaleString(\'ru-RU\')} <span className="text-[10px] text-slate-500">₽</span></div>'
)
content = content.replace(
    '<div className="font-semibold text-white">{obj.closingAmount?.toLocaleString(\'ru-RU\')} ₽</div>',
    '<div className="font-semibold text-white flex items-baseline gap-1 whitespace-nowrap overflow-hidden text-ellipsis">{obj.closingAmount?.toLocaleString(\'ru-RU\')} <span className="text-[10px] text-slate-500">₽</span></div>'
)
content = content.replace(
    '<div className="font-semibold text-slate-300">{obj.costAmount?.toLocaleString(\'ru-RU\')} ₽</div>',
    '<div className="font-semibold text-slate-300 flex items-baseline gap-1 whitespace-nowrap overflow-hidden text-ellipsis">{obj.costAmount?.toLocaleString(\'ru-RU\')} <span className="text-[10px] text-slate-500">₽</span></div>'
)

# Note: Profit uses a dynamic class, so we use regex
profit_pattern = r'<div className=\{`font-semibold \$\{.*\}`\}>\s*\{.*\((obj\.closingAmount \|\| 0\) - \(obj\.costAmount \|\| 0\)\)\.toLocaleString\(\'ru-RU\'\)\} ₽\s*</div>'
profit_replacement = r'<div className={`font-semibold flex items-baseline gap-1 whitespace-nowrap overflow-hidden text-ellipsis ${((obj.closingAmount || 0) - (obj.costAmount || 0)) < 0 ? \'text-red-400\' : \'text-emerald-400\'}`}>{((obj.closingAmount || 0) - (obj.costAmount || 0)).toLocaleString(\'ru-RU\')} <span className="text-[10px] opacity-50">₽</span></div>'

content = re.sub(profit_pattern, profit_replacement, content)

with open('src/components/views/ActiveObjectCard.tsx', 'w') as f:
    f.write(content)

print("UI Fixed!")
