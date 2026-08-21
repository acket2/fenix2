import re

with open('src/components/views/MainView.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { getStorageNotes", "import { db } from '../../lib/firebase';\nimport { doc, onSnapshot, setDoc } from 'firebase/firestore';\nimport { getStorageNotes")

with open('src/components/views/MainView.tsx', 'w') as f:
    f.write(content)
