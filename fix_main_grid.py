import re

with open('src/components/views/MainView.tsx', 'r') as f:
    content = f.read()

# Fix the grid layout
content = content.replace(
    'col-span-1 md:col-span-2 bg-slate-800/80 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col',
    'col-span-1 sm:col-span-2 md:col-span-2 bg-slate-800/80 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col'
)

# And fix the stats map so the 5th stat spans correctly
content = content.replace(
    "${index === 4 ? 'col-span-1 sm:col-span-2 md:col-span-4' : 'col-span-1 sm:col-span-1'}",
    "${index === 4 ? 'col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-4' : 'col-span-1 sm:col-span-1'}"
)

# Make the wrapper for objects columns responsive
# There are two of these (Active and Completed objects)
content = content.replace(
    '<div className="col-span-1 md:col-span-2 bg-slate-800/80 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col">',
    '<div className="col-span-1 sm:col-span-2 md:col-span-2 bg-slate-800/80 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col w-full">'
)

with open('src/components/views/MainView.tsx', 'w') as f:
    f.write(content)
