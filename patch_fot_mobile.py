import re

with open('src/components/views/FotView.tsx', 'r') as f:
    content = f.read()

# Make the wrapper truly scrollable
content = content.replace(
    '<div className="overflow-x-auto pb-4 custom-scrollbar">', 
    '<div className="overflow-x-auto w-full pb-4 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">'
)

# Modify the sticky columns for mobile
content = content.replace(
    '<th className="text-left font-bold uppercase text-slate-400 p-2 sticky left-0 bg-slate-900 border-b border-slate-700/50 z-20" style={{ minWidth: \'160px\' }}>',
    '<th className="text-left font-bold uppercase text-slate-400 p-2 sm:sticky sm:left-0 bg-slate-900 border-b border-slate-700/50 sm:z-20" style={{ minWidth: \'160px\' }}>'
)
content = content.replace(
    '<th className="text-center font-bold uppercase text-slate-400 p-2 sticky bg-slate-900 border-b border-slate-700/50 z-20" style={{ left: \'160px\', minWidth: \'70px\' }}>',
    '<th className="text-center font-bold uppercase text-slate-400 p-2 sm:sticky bg-slate-900 border-b border-slate-700/50 sm:z-20" style={{ left: \'160px\', minWidth: \'70px\' }}>'
)

content = content.replace(
    '<td className="p-2 sticky left-0 bg-slate-800/80 text-white group-hover:bg-slate-900/50 border-r border-slate-700/50 z-10" style={{ minWidth: \'160px\', maxWidth: \'160px\' }}>',
    '<td className="p-2 sm:sticky sm:left-0 bg-slate-800 text-white group-hover:bg-slate-900/50 border-r border-slate-700/50 sm:z-10" style={{ minWidth: \'160px\', maxWidth: \'160px\' }}>'
)
content = content.replace(
    '<td className="p-1 sticky bg-slate-800/80 text-white group-hover:bg-slate-900/50 border-r border-slate-700/50 z-10 text-center" style={{ left: \'160px\', minWidth: \'70px\', maxWidth: \'70px\' }}>',
    '<td className="p-1 sm:sticky bg-slate-800 text-white group-hover:bg-slate-900/50 border-r border-slate-700/50 sm:z-10 text-center" style={{ left: \'160px\', minWidth: \'70px\', maxWidth: \'70px\' }}>'
)


with open('src/components/views/FotView.tsx', 'w') as f:
    f.write(content)
