import re

with open('src/components/views/ActiveObjectCard.tsx', 'r') as f:
    content = f.read()

# Add React.memo
if 'export default React.memo(ActiveObjectCard)' not in content:
    content = content.replace('export default ActiveObjectCard;', 'export default React.memo(ActiveObjectCard);')
    with open('src/components/views/ActiveObjectCard.tsx', 'w') as f:
        f.write(content)
