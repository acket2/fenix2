import re
import os

files_to_patch = [
    'src/components/views/FotView.tsx',
    'src/components/views/ObjectsView.tsx',
    'src/components/views/TasksView.tsx',
    'src/components/views/AdminView.tsx'
]

for file_path in files_to_patch:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check if app-storage-changed is already there
    if 'app-storage-changed' in content:
        continue
        
    # Find useEffect for loadData
    if 'useEffect(() => { loadData(); }, []);' in content:
        new_use_effect = """  useEffect(() => { 
    loadData(); 
    window.addEventListener('app-storage-changed', loadData);
    return () => window.removeEventListener('app-storage-changed', loadData);
  }, []);"""
        content = content.replace('  useEffect(() => { loadData(); }, []);', new_use_effect)
    elif 'useEffect(() => {\n    loadData();\n  }, []);' in content:
        new_use_effect = """  useEffect(() => {
    loadData();
    window.addEventListener('app-storage-changed', loadData);
    return () => window.removeEventListener('app-storage-changed', loadData);
  }, []);"""
        content = content.replace('  useEffect(() => {\n    loadData();\n  }, []);', new_use_effect)
    elif 'useEffect(() => {\n    loadData();\n  }, [currentYear, currentMonth]);' in content:
        new_use_effect = """  useEffect(() => {
    loadData();
    window.addEventListener('app-storage-changed', loadData);
    return () => window.removeEventListener('app-storage-changed', loadData);
  }, [currentYear, currentMonth]);"""
        content = content.replace('  useEffect(() => {\n    loadData();\n  }, [currentYear, currentMonth]);', new_use_effect)
    
    with open(file_path, 'w') as f:
        f.write(content)

