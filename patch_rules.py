with open('firestore.rules', 'r') as f:
    content = f.read()

content = content.replace("match /settings/{document=**} {", "match /plans/{document=**} { allow read, write: if true; }\n    match /documents/{document=**} { allow read, write: if true; }\n    match /settings/{document=**} {")

with open('firestore.rules', 'w') as f:
    f.write(content)
