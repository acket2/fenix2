with open('src/components/views/MainView.tsx', 'r') as f:
    content = f.read()

# Fix addStorageNote
content = content.replace(
"""    addStorageNote({
      content: newNote,
      authorName: user.login,
      tabId: 'main',
      imageUrl: newImage
    });""",
    "addStorageNote(newNote, user, 'main', newImage);"
)

with open('src/components/views/MainView.tsx', 'w') as f:
    f.write(content)

# Fix ActiveObjectCard
with open('src/components/views/ActiveObjectCard.tsx', 'r') as f:
    content = f.read()

# Fix file upload
content = content.replace("const uploadedFile = await uploadProjectFile(obj.id, file);",
    "const uploadedFile = await uploadProjectFile(obj.id, file);\n      const fullFile = { ...uploadedFile, id: Date.now().toString(), uploadedAt: Date.now() };")
content = content.replace("const newFiles = [...(obj.files || []), uploadedFile];",
    "const newFiles = [...(obj.files || []), fullFile];")

# Fix manager role
content = content.replace("user.role === 'admin' || user.role === 'manager'", "user.role === 'admin'")

# Add React.FC to component
content = content.replace("export default function ActiveObjectCard({ obj, index, user }: ActiveObjectCardProps)", 
    "const ActiveObjectCard: React.FC<ActiveObjectCardProps> = ({ obj, index, user }) =>")
content = content.replace("export default function ActiveObjectCard", "const ActiveObjectCard: React.FC<ActiveObjectCardProps>")
content += "\nexport default ActiveObjectCard;\n"

with open('src/components/views/ActiveObjectCard.tsx', 'w') as f:
    f.write(content)
