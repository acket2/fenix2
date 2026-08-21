import os

code = """
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadProjectFile = async (projectId: string, file: File): Promise<{name: string, url: string}> => {
  const fileRef = ref(storage, `projects/${projectId}/${Date.now()}_${file.name}`);
  
  // Добавляем таймаут для загрузки, так как Firebase Storage может зависать без правильных настроек CORS
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Превышено время ожидания загрузки файла. Возможно, в вашем Firebase проекте не настроен Storage или правила CORS.'));
    }, 15000);

    try {
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      clearTimeout(timeout);
      resolve({ name: file.name, url });
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
};
"""

with open('src/utils/storage.ts', 'r', encoding='utf-8') as f:
    content = f.read()

import re
content = re.sub(r'export const uploadProjectFile = async .*?};\n', code.strip() + '\n', content, flags=re.DOTALL)

with open('src/utils/storage.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("upload fixed")
