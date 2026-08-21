import re

with open('src/components/DashboardLayout.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'<div\s*className=\{\`\$\{\s*sidebarOpen \? \'w-72\' : \'w-20\'\s*\}\ \$\{\s*isMobile \? \'fixed inset-y-0 left-0 z-30\' : \'relative\'\s*\}\s*bg-slate-800/95 border-r border-slate-700/50 transition-all duration-300 flex flex-col shadow-2xl\`\}',
    r'<div\n        className={`\n          ${isMobile ? \'fixed inset-y-0 left-0 z-40\' : \'relative\'} \n          ${sidebarOpen ? \'w-72 translate-x-0\' : (isMobile ? \'-translate-x-full w-72\' : \'w-20 translate-x-0\')}\n          bg-slate-800/95 border-r border-slate-700/50 transition-all duration-300 flex flex-col shadow-2xl\n        `}',
    content,
    flags=re.MULTILINE
)

with open('src/components/DashboardLayout.tsx', 'w') as f:
    f.write(content)

