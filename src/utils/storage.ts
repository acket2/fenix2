import { User, RegistrationRequest, Note, Role, StatItem, ActiveObject, TableObject, Task, FotRecord } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, onSnapshot, deleteDoc } from 'firebase/firestore';

const USERS_KEY = 'phoenix_users';
const REQUESTS_KEY = 'phoenix_requests';
const NOTES_KEY = 'phoenix_notes';
const STATS_KEY = 'phoenix_stats';
const OBJECTS_KEY = 'phoenix_objects';
const TABLE_OBJECTS_KEY = 'phoenix_table_objects';
const TASKS_KEY = 'phoenix_tasks';
const FOT_KEY = 'phoenix_fot';

// Sync helpers
function syncToLocal(key: string, data: any[]) {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new Event('app-storage-changed'));
}

export const initStorage = async () => {
  const usersStr = localStorage.getItem(USERS_KEY);
  if (!usersStr) {
    const defaultAdmin: User = { id: '1', login: 'serega', password: 'serega', role: 'admin' };
    localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
  }

  // Setup Firestore listeners
  onSnapshot(collection(db, 'users'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
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

  onSnapshot(collection(db, 'tasks'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
    syncToLocal(TASKS_KEY, data);
  });

  onSnapshot(collection(db, 'fot'), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FotRecord[];
    syncToLocal(FOT_KEY, data);
  });
};

export const getStorageUsers = (): User[] => {
  const usersStr = localStorage.getItem(USERS_KEY);
  return usersStr ? JSON.parse(usersStr) : [];
};

export const deleteStorageUser = async (id: string) => {
  await deleteDoc(doc(db, 'users', id));
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
    imageUrl
  };
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
  await setDoc(doc(db, 'table_objects', obj.id), obj);
};

export const deleteTableObject = async (id: string) => {
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
  await setDoc(doc(db, 'tasks', task.id), task);
};

export const deleteTask = async (id: string) => {
  await deleteDoc(doc(db, 'tasks', id));
};

export const getFotRecords = (): FotRecord[] => {
  const str = localStorage.getItem(FOT_KEY);
  if (str) return JSON.parse(str);
  return [];
};

export const updateFotRecord = async (record: FotRecord) => {
  await setDoc(doc(db, 'fot', record.id), record);
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

import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadProjectFile = async (projectId: string, file: File): Promise<{name: string, url: string}> => {
  const fileRef = ref(storage, `projects/${projectId}/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return { name: file.name, url };
};
