with open('src/components/views/ActiveObjectCard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'const ActiveObjectCard = ({ obj, index, user }: ActiveObjectCardProps) => {',
    'const ActiveObjectCard = ({ obj, index, user, onNavigate }: ActiveObjectCardProps) => {'
)

# And also try this one:
content = content.replace(
    'const ActiveObjectCard: React.FC<ActiveObjectCardProps> = ({ obj, index, user }) => {',
    'const ActiveObjectCard: React.FC<ActiveObjectCardProps> = ({ obj, index, user, onNavigate }) => {'
)

# And another variation
content = content.replace(
    'export default function ActiveObjectCard({ obj, index, user }: ActiveObjectCardProps) {',
    'export default function ActiveObjectCard({ obj, index, user, onNavigate }: ActiveObjectCardProps) {'
)

with open('src/components/views/ActiveObjectCard.tsx', 'w') as f:
    f.write(content)
