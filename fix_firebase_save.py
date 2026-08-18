import re

with open('src/components/views/MainView.tsx', 'r') as f:
    content = f.read()

# Replace localStorage logic with the correct updateTableObject for creation
old_add_active = """    const currentObjects = getTableObjects();
    localStorage.setItem('phoenix_table_objects', JSON.stringify([...currentObjects, newObj]));
    window.dispatchEvent(new Event('app-storage-changed'));
    setNewObjectName('');
    loadData();"""

new_add_active = """    updateTableObject(newObj).then(() => {
      setNewObjectName('');
      loadData();
    });"""

content = content.replace(old_add_active, new_add_active)

old_add_completed = """    const currentObjects = getTableObjects();
    localStorage.setItem('phoenix_table_objects', JSON.stringify([...currentObjects, newObj]));
    window.dispatchEvent(new Event('app-storage-changed'));
    setNewCompletedName('');
    loadData();"""

new_add_completed = """    updateTableObject(newObj).then(() => {
      setNewCompletedName('');
      loadData();
    });"""

content = content.replace(old_add_completed, new_add_completed)

with open('src/components/views/MainView.tsx', 'w') as f:
    f.write(content)
