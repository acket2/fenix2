import re

with open('src/components/views/ObjectsView.tsx', 'r') as f:
    content = f.read()

# Make the wrapper truly scrollable
content = content.replace(
    '<div className="overflow-x-auto pb-4 custom-scrollbar">', 
    '<div className="overflow-x-auto w-full pb-4 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">'
)

with open('src/components/views/ObjectsView.tsx', 'w') as f:
    f.write(content)
