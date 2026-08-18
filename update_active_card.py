import re

with open('src/components/views/ActiveObjectCard.tsx', 'r') as f:
    content = f.read()

# Replace interface
if 'onNavigate?: () => void;' not in content:
    content = content.replace(
        'interface ActiveObjectCardProps {\n  obj: TableObject;\n  index: number;\n  user: User;\n}',
        'interface ActiveObjectCardProps {\n  obj: TableObject;\n  index: number;\n  user: User;\n  onNavigate?: () => void;\n}'
    )

content = content.replace(
    'const ActiveObjectCard = ({ obj, index, user }: ActiveObjectCardProps) => {',
    'const ActiveObjectCard = ({ obj, index, user, onNavigate }: ActiveObjectCardProps) => {'
)

# Replace obj.name with a button/link
content = content.replace(
    '<div className="text-sm font-bold text-white pr-6">{obj.name}</div>',
    '<button onClick={onNavigate} className="text-sm font-bold text-white pr-6 hover:text-cyan-400 text-left transition-colors cursor-pointer group-hover:text-cyan-300">{obj.name}</button>'
)

# Remove files section
files_pattern = r'            \{\/\* Documents Area \*\/\}[\s\S]*?<\/button>\s*<input\s*type="file"\s*ref=\{fileInputRef\}\s*onChange=\{handleFileUpload\}\s*className="hidden"\s*\/>\s*<\/div>'

content = re.sub(files_pattern, '', content)

with open('src/components/views/ActiveObjectCard.tsx', 'w') as f:
    f.write(content)
