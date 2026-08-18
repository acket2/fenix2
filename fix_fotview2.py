import re

with open('src/components/views/FotView.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<div className="bg-slate-800/80 text-white border border-slate-700/50 shadow-sm p-4">',
    '<div className="bg-slate-800/80 text-white border border-slate-700/50 shadow-sm p-4 min-w-0 overflow-hidden">'
)

content = content.replace(
    '<div className="space-y-6">',
    '<div className="space-y-6 w-full min-w-0 max-w-full">'
)

with open('src/components/views/FotView.tsx', 'w') as f:
    f.write(content)
