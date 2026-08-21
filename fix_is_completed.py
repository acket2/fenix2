import re

with open('src/components/views/ActiveObjectCard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const isCompleted = editForm.progress === 100 ? true : editForm.isCompleted;",
    "const isCompleted = editForm.progress === 100;"
)

with open('src/components/views/ActiveObjectCard.tsx', 'w') as f:
    f.write(content)
