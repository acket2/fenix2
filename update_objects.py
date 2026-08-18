with open('src/components/views/ObjectsView.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'interface ObjectsViewProps {\n  user: User;\n}',
    'interface ObjectsViewProps {\n  user: User;\n  onNavigateToProject?: (id: string) => void;\n}'
)

content = content.replace(
    'export default function ObjectsView({ user }: ObjectsViewProps) {',
    'export default function ObjectsView({ user, onNavigateToProject }: ObjectsViewProps) {'
)

content = content.replace(
    '<td className="p-3 text-sm font-bold text-white">{obj.name}</td>',
    '<td className="p-3 text-sm font-bold text-white"><button onClick={() => onNavigateToProject && onNavigateToProject(obj.id)} className="hover:text-cyan-400 transition-colors text-left">{obj.name}</button></td>'
)

with open('src/components/views/ObjectsView.tsx', 'w') as f:
    f.write(content)
