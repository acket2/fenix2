with open('src/components/views/MainView.tsx', 'r') as f:
    content = f.read()

import_str = "import ActiveObjectCard from './ActiveObjectCard';\nimport { getStorageNotes"
content = content.replace("import { getStorageNotes", import_str)

start_str = "activeObjects.map((obj, index) => ("
end_str = "))\n              )}"

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx) + len("))")

if start_idx != -1 and end_idx != -1:
    new_map = "activeObjects.map((obj, index) => (\n                  <ActiveObjectCard key={obj.id} obj={obj} index={index} user={user} />\n                ))"
    content = content[:start_idx] + new_map + content[end_idx:]

with open('src/components/views/MainView.tsx', 'w') as f:
    f.write(content)
