import re

with open('src/lib/firebase.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "import { getFirestore, collection", 
    "import { getFirestore, initializeFirestore, collection"
)

content = content.replace(
    "export const db = getFirestore(app, \"ai-studio-bbfb202e-374e-438e-9c0b-82f1fdbe19e0\");",
    "export const db = initializeFirestore(app, { experimentalForceLongPolling: true }, \"ai-studio-bbfb202e-374e-438e-9c0b-82f1fdbe19e0\");"
)

with open('src/lib/firebase.ts', 'w') as f:
    f.write(content)
