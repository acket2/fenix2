import re

with open('src/components/views/AdminView.tsx', 'r') as f:
    content = f.read()

# Make the wrapper truly scrollable
content = content.replace(
    '<div className="overflow-x-auto">', 
    '<div className="overflow-x-auto w-full -mx-4 px-4 sm:mx-0 sm:px-0">'
)

with open('src/components/views/AdminView.tsx', 'w') as f:
    f.write(content)
