with open('src/components/DashboardLayout.tsx', 'r') as f:
    content = f.read()

content = content.replace("\\'", "'")

with open('src/components/DashboardLayout.tsx', 'w') as f:
    f.write(content)
