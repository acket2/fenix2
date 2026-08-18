import re

with open('src/components/DashboardLayout.tsx', 'r') as f:
    content = f.read()

# Fix the padding on the main content area so it's not squished on mobile
content = content.replace(
    '<div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">',
    '<div className="flex-1 overflow-auto p-3 sm:p-6 md:p-8 w-full max-w-[100vw]">'
)

# And fix the header for mobile (text overflow)
content = content.replace(
    '<h1 className="text-xl font-bold text-white tracking-tight hidden sm:block">',
    '<h1 className="text-lg sm:text-xl font-bold text-white tracking-tight hidden sm:block truncate max-w-[150px] sm:max-w-none">'
)

with open('src/components/DashboardLayout.tsx', 'w') as f:
    f.write(content)
