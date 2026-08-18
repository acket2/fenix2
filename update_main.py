with open('src/components/views/MainView.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'interface MainViewProps {\n  user: User;\n}',
    'interface MainViewProps {\n  user: User;\n  onNavigateToProject?: (id: string) => void;\n}'
)

content = content.replace(
    'export default function MainView({ user }: MainViewProps) {',
    'export default function MainView({ user, onNavigateToProject }: MainViewProps) {'
)

content = content.replace(
    '<ActiveObjectCard key={obj.id} obj={obj} index={index} user={user} />',
    '<ActiveObjectCard key={obj.id} obj={obj} index={index} user={user} onNavigate={() => onNavigateToProject && onNavigateToProject(obj.id)} />'
)

with open('src/components/views/MainView.tsx', 'w') as f:
    f.write(content)
