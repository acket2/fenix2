with open("src/utils/storage.ts", "r", encoding="utf-8") as f:
    content = f.read()

imports = """import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
"""
with open("src/utils/storage.ts", "w", encoding="utf-8") as f:
    f.write(imports + content)
