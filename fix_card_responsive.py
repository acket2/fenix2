import re

with open('src/components/views/ActiveObjectCard.tsx', 'r') as f:
    content = f.read()

# Fix Edit Mode
content = content.replace(
    '<div className="grid grid-cols-3 gap-2">',
    '<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">'
)

# Fix View Mode
content = content.replace(
    '<div className="grid grid-cols-4 gap-2 bg-slate-900/30 p-2 rounded-lg border border-slate-700/30 text-xs">',
    '<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 bg-slate-900/30 p-3 sm:p-2 rounded-lg border border-slate-700/30 text-xs">'
)

with open('src/components/views/ActiveObjectCard.tsx', 'w') as f:
    f.write(content)
