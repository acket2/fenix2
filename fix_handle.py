import re

with open('src/components/views/MainView.tsx', 'r') as f:
    content = f.read()

injection = """  const handleAddQuickObject = () => {
    if (!newObjectName.trim()) return;
    
    const newObj: TableObject = {
      id: Date.now().toString(),
      name: newObjectName,
      customer: 'Новый заказчик',
      contractAmount: 0,
      costAmount: 0,
      closingAmount: 0,
      progress: 0,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      isCompleted: false
    };
    
    updateTableObject(newObj).then(() => {
      setNewObjectName('');
      loadData();
    });
  };

  const handleAddCompleted = () => {
    if (!newCompletedName.trim()) return;
    
    const newObj: TableObject = {
      id: Date.now().toString(),
      name: newCompletedName,
      customer: 'Новый заказчик',
      contractAmount: 0,
      costAmount: 0,
      closingAmount: 0,
      progress: 100,
      color: 'bg-gradient-to-r from-emerald-500 to-green-500',
      isCompleted: true
    };
    
    updateTableObject(newObj).then(() => {
      setNewCompletedName('');
      loadData();
    });
  };"""

content = re.sub(r'  const handleAddQuickObject = \(\) => \{.*?\n  \};\n', injection, content, flags=re.DOTALL)

with open('src/components/views/MainView.tsx', 'w') as f:
    f.write(content)
