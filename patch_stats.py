import re

with open('src/components/views/MainView.tsx', 'r') as f:
    content = f.read()

# Fix stats wrapping for mobile 
# Currently: className={`bg-slate-800 p-5 rounded-2xl border border-slate-700/50 shadow-xl relative group ${index === 4 ? 'col-span-1 md:col-span-4' : 'col-span-1'}`}
# Change to: className={`bg-slate-800 p-5 rounded-2xl border border-slate-700/50 shadow-xl relative group ${index === 4 ? 'col-span-2 md:col-span-4' : 'col-span-2 sm:col-span-1'}`}

content = content.replace(
    "${index === 4 ? 'col-span-1 md:col-span-4' : 'col-span-1'}",
    "${index === 4 ? 'col-span-1 sm:col-span-2 md:col-span-4' : 'col-span-1 sm:col-span-1'}"
)

# And fix grid on MainView wrapper
content = content.replace(
    '<div className="grid grid-cols-1 md:grid-cols-4 gap-6">',
    '<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full">'
)

# Active object wrapper
content = content.replace(
    '<div className="col-span-1 md:col-span-2 bg-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col">',
    '<div className="col-span-1 sm:col-span-2 bg-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col w-full">'
)

with open('src/components/views/MainView.tsx', 'w') as f:
    f.write(content)
