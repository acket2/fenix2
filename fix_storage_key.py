import re

with open('src/components/views/MainView.tsx', 'r') as f:
    content = f.read()

content = content.replace("localStorage.setItem('phoenix_objects'", "localStorage.setItem('phoenix_table_objects'")

with open('src/components/views/MainView.tsx', 'w') as f:
    f.write(content)
