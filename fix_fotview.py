import re

with open('src/components/views/FotView.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<div className="bg-slate-800/80 rounded-2xl border border-slate-700/50 shadow-xl p-4 md:p-6">',
    '<div className="bg-slate-800/80 rounded-2xl border border-slate-700/50 shadow-xl p-4 md:p-6 min-w-0 w-full overflow-hidden">'
)

content = content.replace(
    '<div className="overflow-x-auto custom-scrollbar">',
    '<div className="overflow-x-auto custom-scrollbar w-full">'
)

with open('src/components/views/FotView.tsx', 'w') as f:
    f.write(content)
