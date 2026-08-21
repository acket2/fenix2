import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User, RegistrationRequest, Note, Role, StatItem, ActiveObject, TableObject, Task, FotRecord, WarehouseItem, PlanTask, DocumentFile, WarehouseColumnDef } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, onSnapshot, deleteDoc } from 'firebase/firestore';

const USERS_KEY = 'phoenix_users';
const REQUESTS_KEY = 'phoenix_requests';
const NOTES_KEY = 'phoenix_notes';
const STATS_KEY = 'phoenix_stats';
const OBJECTS_KEY = 'phoenix_objects';
const TABLE_OBJECTS_KEY = 'phoenix_table_objects';
const TASKS_KEY = 'phoenix_tasks';
const PLANS_KEY = 'phoenix_plans';
const DOCUMENTS_KEY = 'phoenix_documents';
const FOT_KEY = 'phoenix_fot';
const WAREHOUSE_KEY = 'phoenix_warehouse';
const WAREHOUSE_CATEGORIES_KEY = 'phoenix_warehouse_categories';
const WAREHOUSE_COLUMNS_KEY = 'phoenix_warehouse_columns';

// Sync helpers
function syncToLocal(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new Event('app-storage-changed'));
}

export const initStorage = async () => {
  const usersStr = localStorage.getItem(USERS_KEY);
  const defaultAdmin: User = { id: 'admin-serega', login: 'serega', password: 'serega', role: 'admin' };
  
  if (!usersStr) {
    localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
    setDoc(doc(db, 'users', defaultAdmin.id), defaultAdmin);
  }

  // Setup Firestore listeners
  onSnapshot(collection(db, 'users'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
    
    // Recovery for admin user
    const serega = data.find(u => u.login === 'serega');
    if (!serega) {
      setDoc(doc(db, 'users', defaultAdmin.id), defaultAdmin);
      data.push(defaultAdmin);
    } else if (serega.role !== 'admin') {
      const updatedSerega = { ...serega, role: 'admin' as const };
      setDoc(doc(db, 'users', serega.id), updatedSerega);
      // Force update local session if needed
      const session = localStorage.getItem('phoenix_session');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed.login === 'serega') {
          parsed.role = 'admin';
          localStorage.setItem('phoenix_session', JSON.stringify(parsed));
          window.dispatchEvent(new Event('storage'));
        }
      }
    }
    
    if (data.length > 0) syncToLocal(USERS_KEY, data);
  });

  onSnapshot(collection(db, 'requests'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RegistrationRequest[];
    syncToLocal(REQUESTS_KEY, data);
  });

  onSnapshot(collection(db, 'notes'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Note[];
    syncToLocal(NOTES_KEY, data);
  });

  onSnapshot(collection(db, 'stats'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StatItem[];
    if (data.length > 0) syncToLocal(STATS_KEY, data);
  });

  onSnapshot(collection(db, 'objects'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ActiveObject[];
    if (data.length > 0) syncToLocal(OBJECTS_KEY, data);
  });

  onSnapshot(collection(db, 'table_objects'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TableObject[];
    if (data.length > 0) syncToLocal(TABLE_OBJECTS_KEY, data);
  });

  
  onSnapshot(collection(db, 'plans'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PlanTask[];
    syncToLocal(PLANS_KEY, data);
  });
  onSnapshot(collection(db, 'documents'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DocumentFile[];
    syncToLocal(DOCUMENTS_KEY, data);
  });

  onSnapshot(collection(db, 'tasks'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
    syncToLocal(TASKS_KEY, data);
  });

  onSnapshot(collection(db, 'fot'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FotRecord[];
    syncToLocal(FOT_KEY, data);
  });
  
  onSnapshot(collection(db, 'warehouse'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WarehouseItem[];
    syncToLocal(WAREHOUSE_KEY, data);
  });

  onSnapshot(doc(db, 'settings', 'warehouse_columns'), (docSnapshot) => {
    if (docSnapshot.exists()) {
      syncToLocal(WAREHOUSE_COLUMNS_KEY, docSnapshot.data());
    }
  });
};

export const getStorageUsers = (): User[] => {
  const usersStr = localStorage.getItem(USERS_KEY);
  return usersStr ? JSON.parse(usersStr) : [];
};

export const deleteStorageUser = async (id: string) => {
  await deleteDoc(doc(db, 'users', id));
};

export const updateUserPassword = async (userId: string, newPassword: string) => {
  const users = getStorageUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    const updatedUser = { ...users[userIndex], password: newPassword };
    await setDoc(doc(db, 'users', userId), updatedUser);
  }
};

export const getStorageRequests = (): RegistrationRequest[] => {
  const reqStr = localStorage.getItem(REQUESTS_KEY);
  return reqStr ? JSON.parse(reqStr) : [];
};

export const deleteRegistrationRequest = async (id: string) => {
  await deleteDoc(doc(db, 'requests', id));
};

export const getStorageNotes = (): Note[] => {
  const notesStr = localStorage.getItem(NOTES_KEY);
  return notesStr ? JSON.parse(notesStr) : [];
};

export const addStorageNote = async (content: string, author: User, tabId?: string, imageUrl?: string) => {
  const note: Note = {
    id: Date.now().toString(),
    content,
    authorId: author.id,
    authorName: author.login,
    createdAt: Date.now(),
    tabId,
  };
  if (imageUrl) {
    note.imageUrl = imageUrl;
  }
  await setDoc(doc(db, 'notes', note.id), note);
};

export const deleteStorageNote = async (id: string) => {
  await deleteDoc(doc(db, 'notes', id));
};

export const getStorageStats = (): StatItem[] => {
  const statsStr = localStorage.getItem(STATS_KEY);
  if (statsStr) return JSON.parse(statsStr);
  return [
    { id: '1', label: 'Активные стройки', value: '14', trend: 'Всего объектов', trendColor: 'text-slate-400' },
    { id: '2', label: 'Завершенные объекты', value: '5', trend: 'ЖК Северное Сияние, ТЦ Авангард...', trendColor: 'text-blue-600' },
    { id: '3', label: 'Сумма контрактов общая', value: '25 450 000 ₽', trend: 'По всем активным объектам', trendColor: 'text-slate-400' },
    { id: '4', label: 'Сумма закрытия общая', value: '18 750 000 ₽', trend: '+12% к прошлому месяцу', trendColor: 'text-blue-600' },
    { id: '5', label: 'Прибыль', value: '4 120 000 ₽', trend: 'Чистая прибыль текущая', trendColor: 'text-blue-600' }
  ];
};

export const updateStorageStat = async (updatedStat: StatItem) => {
  const stats = getStorageStats();
  const index = stats.findIndex(s => s.id === updatedStat.id);
  if (index !== -1) stats[index] = updatedStat;
  else stats.push(updatedStat);
  syncToLocal(STATS_KEY, stats);
  await setDoc(doc(db, 'stats', updatedStat.id), updatedStat);
};

export const getStorageObjects = (): ActiveObject[] => {
  const objStr = localStorage.getItem(OBJECTS_KEY);
  if (objStr) return JSON.parse(objStr);
  return [
    { id: '1', name: "ЖК 'Северное Сияние'", progress: 75, color: 'bg-blue-500' },
    { id: '2', name: "ТЦ 'Авангард'", progress: 30, color: 'bg-sky-500' }
  ];
};

export const updateStorageObject = async (updatedObj: ActiveObject) => {
  const objects = getStorageObjects();
  const index = objects.findIndex(o => o.id === updatedObj.id);
  if (index !== -1) objects[index] = updatedObj;
  else objects.push(updatedObj);
  syncToLocal(OBJECTS_KEY, objects);
  await setDoc(doc(db, 'objects', updatedObj.id), updatedObj);
};

export const getTableObjects = (): TableObject[] => {
  const str = localStorage.getItem(TABLE_OBJECTS_KEY);
  if (str) return JSON.parse(str);
  return [
    { id: '1', name: 'ЖК Северное Сияние', customer: 'ООО ИнвестСтрой', contractAmount: 15000000, costAmount: 10000000, closingAmount: 12000000, isCompleted: false },
    { id: '2', name: 'ТЦ Авангард', customer: 'ИП Смирнов', contractAmount: 8000000, costAmount: 5000000, closingAmount: 8000000, isCompleted: true }
  ];
};

export const updateTableObject = async (obj: TableObject) => {
  const cleanObj = Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined)) as TableObject;
  const objects = getTableObjects();
  const index = objects.findIndex(o => o.id === obj.id);
  if (index !== -1) objects[index] = cleanObj;
  else objects.push(cleanObj);
  syncToLocal(TABLE_OBJECTS_KEY, objects);
  await setDoc(doc(db, 'table_objects', cleanObj.id), cleanObj);
};

export const deleteTableObject = async (id: string) => {
  const objects = getTableObjects();
  syncToLocal(TABLE_OBJECTS_KEY, objects.filter(o => o.id !== id));
  await deleteDoc(doc(db, 'table_objects', id));
};

export const getTasks = (): Task[] => {
  const str = localStorage.getItem(TASKS_KEY);
  if (str) return JSON.parse(str);
  return [
    { id: '1', title: 'Закупить цемент 500 мешков', isCompleted: false },
    { id: '2', title: 'Оформить пропуска для новой бригады', isCompleted: true }
  ];
};

export const updateTask = async (task: Task) => {
  const cleanTask = Object.fromEntries(Object.entries(task).filter(([_, v]) => v !== undefined)) as Task;
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === task.id);
  if (index !== -1) tasks[index] = cleanTask;
  else tasks.push(cleanTask);
  syncToLocal(TASKS_KEY, tasks);
  await setDoc(doc(db, 'tasks', cleanTask.id), cleanTask);
};

export const deleteTask = async (id: string) => {
  const tasks = getTasks();
  syncToLocal(TASKS_KEY, tasks.filter(t => t.id !== id));
  await deleteDoc(doc(db, 'tasks', id));
};


export const getPlans = (): PlanTask[] => {
  const str = localStorage.getItem(PLANS_KEY);
  if (str) return JSON.parse(str);
  return [];
};

export const updatePlan = async (plan: PlanTask) => {
  const cleanPlan = Object.fromEntries(Object.entries(plan).filter(([_, v]) => v !== undefined)) as PlanTask;
  const plans = getPlans();
  const index = plans.findIndex(p => p.id === plan.id);
  if (index !== -1) plans[index] = cleanPlan;
  else plans.push(cleanPlan);
  syncToLocal(PLANS_KEY, plans);
  await setDoc(doc(db, 'plans', cleanPlan.id), cleanPlan);
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


export const getFotRecords = (): FotRecord[] => {
  const str = localStorage.getItem(FOT_KEY);
  if (str) return JSON.parse(str);
  return [];
};

export const updateFotRecord = async (record: FotRecord) => {
  const cleanRecord = Object.fromEntries(Object.entries(record).filter(([_, v]) => v !== undefined)) as FotRecord;
  const records = getFotRecords();
  const index = records.findIndex(r => r.id === record.id);
  if (index !== -1) records[index] = cleanRecord;
  else records.push(cleanRecord);
  syncToLocal(FOT_KEY, records);
  await setDoc(doc(db, 'fot', cleanRecord.id), cleanRecord);
};

export const deleteFotRecord = async (id: string) => {
  const records = getFotRecords();
  syncToLocal(FOT_KEY, records.filter(r => r.id !== id));
  await deleteDoc(doc(db, 'fot', id));
};

export const getWarehouseItems = (): WarehouseItem[] => {
  const str = localStorage.getItem(WAREHOUSE_KEY);
  if (str) return JSON.parse(str);
  return [];
};

export const getWarehouseCategories = (): string[] => {
  const str = localStorage.getItem(WAREHOUSE_CATEGORIES_KEY);
  if (str) return JSON.parse(str);
  return ['Ручной инструмент', 'Материал', 'Электро инструменты'];
};

export const addWarehouseCategory = (category: string) => {
  const categories = getWarehouseCategories();
  if (!categories.includes(category)) {
    categories.push(category);
    syncToLocal(WAREHOUSE_CATEGORIES_KEY, categories);
  }
};

export const deleteWarehouseCategory = (category: string) => {
  const categories = getWarehouseCategories().filter(c => c !== category);
  syncToLocal(WAREHOUSE_CATEGORIES_KEY, categories);
};

export const getWarehouseColumnsConfig = (): Record<string, WarehouseColumnDef[]> => {
  const str = localStorage.getItem(WAREHOUSE_COLUMNS_KEY);
  if (str) return JSON.parse(str);
  
  const baseColumns: WarehouseColumnDef[] = [
    { id: 'name', label: 'Наименование', isBase: true },
    { id: 'quantity', label: 'Кол-во', isBase: true },
    { id: 'unit', label: 'Ед. изм.', isBase: true },
    { id: 'notes', label: 'Примечания', isBase: true }
  ];

  const toolsColumns: WarehouseColumnDef[] = [
    { id: 'name', label: 'Наименование', isBase: true },
    { id: 'invNumber', label: 'Инвентарный номер', isBase: false },
    { id: 'buyDate', label: 'Дата покупки', isBase: false },
    { id: 'serialNumber', label: 'Серийный номер', isBase: false },
    { id: 'quantity', label: 'Кол-во', isBase: true },
    { id: 'unit', label: 'Ед. изм.', isBase: true },
    { id: 'notes', label: 'Примечания', isBase: true }
  ];

  return {
    'Материал': [...baseColumns],
    'Ручной инструмент': [...toolsColumns],
    'Электро инструменты': [...toolsColumns],
  };
};

export const updateWarehouseColumnsConfig = async (category: string, columns: WarehouseColumnDef[]) => {
  const config = getWarehouseColumnsConfig();
  config[category] = columns;
  syncToLocal(WAREHOUSE_COLUMNS_KEY, config);
  await setDoc(doc(db, 'settings', 'warehouse_columns'), config);
};

export const updateWarehouseItem = async (item: WarehouseItem) => {
  const cleanItem = Object.fromEntries(Object.entries(item).filter(([_, v]) => v !== undefined)) as WarehouseItem;
  const items = getWarehouseItems();
  const index = items.findIndex(i => i.id === item.id);
  if (index !== -1) items[index] = cleanItem;
  else items.push(cleanItem);
  syncToLocal(WAREHOUSE_KEY, items);
  await setDoc(doc(db, 'warehouse', cleanItem.id), cleanItem);
};

export const deleteWarehouseItem = async (id: string) => {
  const items = getWarehouseItems();
  syncToLocal(WAREHOUSE_KEY, items.filter(i => i.id !== id));
  await deleteDoc(doc(db, 'warehouse', id));
};

export const addRegistrationRequest = async (req: Omit<RegistrationRequest, 'id' | 'createdAt' | 'status'>) => {
  const newReq: RegistrationRequest = {
    ...req,
    id: Date.now().toString(),
    createdAt: Date.now(),
    status: 'pending'
  };
  await setDoc(doc(db, 'requests', newReq.id), newReq);
};

export const updateRequestStatus = async (id: string, status: 'approved' | 'rejected', role: Role = 'user') => {
  const requests = getStorageRequests();
  const reqIndex = requests.findIndex(r => r.id === id);
  
  if (reqIndex !== -1 && requests[reqIndex].status === 'pending') {
    const updatedReq = { ...requests[reqIndex], status };
    await setDoc(doc(db, 'requests', id), updatedReq);
    
    if (status === 'approved') {
      const newUser: User = {
        id: id,
        login: updatedReq.login,
        password: updatedReq.password,
        role: role
      };
      await setDoc(doc(db, 'users', id), newUser);
    }
  }
};



export const uploadProjectFile = async (projectId: string, file: File): Promise<{name: string, url: string}> => {
  return new Promise((resolve, reject) => {
    // Ограничиваем размер файла для Firestore (около 1MB, берем с запасом 800KB)
    const MAX_SIZE = 800 * 1024;
    if (file.size > MAX_SIZE) {
      reject(new Error('Размер файла превышает 800KB. Поскольку используется встроенная база AI Studio, большие файлы не поддерживаются.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      resolve({ name: file.name, url: base64Data });
    };
    reader.onerror = () => {
      reject(new Error('Ошибка при чтении файла'));
    };
    reader.readAsDataURL(file);
  });
};
