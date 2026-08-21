import re

with open('src/utils/storage.ts', 'r') as f:
    content = f.read()

# Add keys
content = content.replace("const TASKS_KEY = 'phoenix_tasks';", "const TASKS_KEY = 'phoenix_tasks';\nconst PLANS_KEY = 'phoenix_plans';\nconst DOCUMENTS_KEY = 'phoenix_documents';")

# Add imports
content = content.replace("Task, FotRecord, WarehouseItem", "Task, FotRecord, WarehouseItem, PlanTask, DocumentFile")

# Add listeners
listener_str = """
  onSnapshot(collection(db, 'plans'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PlanTask[];
    syncToLocal(PLANS_KEY, data);
  });
  onSnapshot(collection(db, 'documents'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DocumentFile[];
    syncToLocal(DOCUMENTS_KEY, data);
  });
"""
content = content.replace("onSnapshot(collection(db, 'tasks'), (snapshot) => {", listener_str + "\n  onSnapshot(collection(db, 'tasks'), (snapshot) => {")

# Add CRUD functions
crud_str = """
export const getPlans = (): PlanTask[] => {
  const str = localStorage.getItem(PLANS_KEY);
  if (str) return JSON.parse(str);
  return [];
};

export const updatePlan = async (plan: PlanTask) => {
  const plans = getPlans();
  const index = plans.findIndex(p => p.id === plan.id);
  if (index !== -1) plans[index] = plan;
  else plans.push(plan);
  syncToLocal(PLANS_KEY, plans);
  await setDoc(doc(db, 'plans', plan.id), plan);
};

export const deletePlan = async (id: string) => {
  const plans = getPlans();
  syncToLocal(PLANS_KEY, plans.filter(p => p.id !== id));
  await deleteDoc(doc(db, 'plans', id));
};

export const getDocuments = (): DocumentFile[] => {
  const str = localStorage.getItem(DOCUMENTS_KEY);
  if (str) return JSON.parse(str);
  return [];
};

export const addDocument = async (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const MAX_SIZE = 800 * 1024;
    if (file.size > MAX_SIZE) {
      reject(new Error('Размер файла превышает 800KB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      const docFile: DocumentFile = {
        id: Date.now().toString(),
        name: file.name,
        url: base64Data,
        uploadedAt: Date.now()
      };
      const docs = getDocuments();
      docs.push(docFile);
      syncToLocal(DOCUMENTS_KEY, docs);
      await setDoc(doc(db, 'documents', docFile.id), docFile);
      resolve();
    };
    reader.onerror = () => reject(new Error('Ошибка при чтении файла'));
    reader.readAsDataURL(file);
  });
};

export const deleteDocument = async (id: string) => {
  const docs = getDocuments();
  syncToLocal(DOCUMENTS_KEY, docs.filter(d => d.id !== id));
  await deleteDoc(doc(db, 'documents', id));
};
"""

content = content.replace("export const getFotRecords", crud_str + "\n\nexport const getFotRecords")

with open('src/utils/storage.ts', 'w') as f:
    f.write(content)
