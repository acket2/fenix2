import re

with open('src/components/DashboardLayout.tsx', 'r') as f:
    content = f.read()

old_sidebar_class = """      <div
        className={`${
          sidebarOpen ? 'w-72' : 'w-20'
        } ${isMobile ? 'fixed inset-y-0 left-0 z-30' : 'relative'} 
         bg-slate-800/95 border-r border-slate-700/50 transition-all duration-300 flex flex-col shadow-2xl`}
      >"""

new_sidebar_class = """      <div
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-30' : 'relative'} 
          ${sidebarOpen ? 'w-72 translate-x-0' : (isMobile ? '-translate-x-full w-72' : 'w-20 translate-x-0')}
          bg-slate-800/95 border-r border-slate-700/50 transition-all duration-300 flex flex-col shadow-2xl
        `}
      >"""

content = content.replace(old_sidebar_class, new_sidebar_class)

with open('src/components/DashboardLayout.tsx', 'w') as f:
    f.write(content)
