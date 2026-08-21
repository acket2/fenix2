import re

with open('src/components/DashboardLayout.tsx', 'r') as f:
    content = f.read()

# Add import
if 'import ObjectDetailsView' not in content:
    content = content.replace("import TasksView from './views/TasksView';", "import TasksView from './views/TasksView';\nimport ObjectDetailsView from './views/ObjectDetailsView';")

# Add state
state_injection = """  const [activeTab, setActiveTab] = useState<TabKey>('main');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);"""
content = content.replace("  const [activeTab, setActiveTab] = useState<TabKey>('main');", state_injection)

# Add clear selected object when tab clicked
handle_tab_click_new = """  const handleTabClick = (id: string) => {
    setActiveTab(id as TabKey);
    setSelectedObjectId(null);
    if (isMobile) setSidebarOpen(false);
  };"""
content = re.sub(r'  const handleTabClick = \(id: string\) => \{[\s\S]*?\};\n', handle_tab_click_new + '\n', content)

# Update renderContent
render_content_old = """  const renderContent = () => {
    switch (activeTab) {
      case 'main': return <MainView user={user} />;
      case 'objects': return <ObjectsView user={user} />;"""
render_content_new = """  const renderContent = () => {
    if (selectedObjectId) {
      return <ObjectDetailsView user={user} objectId={selectedObjectId} onBack={() => setSelectedObjectId(null)} />;
    }

    switch (activeTab) {
      case 'main': return <MainView user={user} onNavigateToProject={(id) => setSelectedObjectId(id)} />;
      case 'objects': return <ObjectsView user={user} onNavigateToProject={(id) => setSelectedObjectId(id)} />;"""
content = content.replace(render_content_old, render_content_new)

with open('src/components/DashboardLayout.tsx', 'w') as f:
    f.write(content)
