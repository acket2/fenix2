import re

with open('src/components/views/MainView.tsx', 'r') as f:
    content = f.read()

# Add states
state_injection = """  const [newObjectName, setNewObjectName] = useState('');
  
  const [baseStats, setBaseStats] = useState({ contract: 0, closing: 0, profit: 0 });
  const [editingBase, setEditingBase] = useState<string | null>(null);
  const [editBaseValue, setEditBaseValue] = useState<string>('');
"""

content = content.replace("  const [newObjectName, setNewObjectName] = useState('');", state_injection)

# Add useEffect for firebase
effect_injection = """  useEffect(() => {
    loadData();
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('app-storage-changed', handleStorageChange);
    
    const unsub = onSnapshot(doc(db, 'settings', 'financial_base'), (docSnap) => {
      if (docSnap.exists()) {
        setBaseStats(docSnap.data() as { contract: number, closing: number, profit: number });
      } else {
        setDoc(doc(db, 'settings', 'financial_base'), { contract: 0, closing: 0, profit: 0 });
      }
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('app-storage-changed', handleStorageChange);
      unsub();
    };
  }, []);"""

content = re.sub(r'  useEffect\(\(\) => \{.*?  \}, \[\]\);\n', effect_injection + '\n', content, flags=re.DOTALL)

with open('src/components/views/MainView.tsx', 'w') as f:
    f.write(content)
