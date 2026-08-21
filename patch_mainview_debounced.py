import re

with open('src/components/views/MainView.tsx', 'r') as f:
    content = f.read()

# Add DebouncedInput to MainView
if 'const DebouncedInput =' not in content:
    debounced_component = """
const DebouncedInput = ({ value, onChange, className, type = "text", placeholder = "", style = {} }: { value: any, onChange: (val: any) => void, className?: string, type?: string, placeholder?: string, style?: any }) => {
  const [localValue, setLocalValue] = React.useState(value);
  React.useEffect(() => { setLocalValue(value); }, [value]);
  const handleBlur = () => { if (localValue !== value) onChange(localValue); };
  return (
    <input
      type={type}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
      className={className}
      placeholder={placeholder}
      style={style}
    />
  );
};
"""
    content = content.replace("export default function MainView", debounced_component + "\nexport default function MainView")

# Replace inputs that might cause lag
content = content.replace("<input\n                  type=\"text\"\n                  value={newNote}\n                onChange={(e) => setNewNote(e.target.value)}", "<DebouncedInput\n                  type=\"text\"\n                  value={newNote}\n                onChange={(val) => setNewNote(val)}")
content = content.replace("value={newObjectName}\n                  onChange={e => setNewObjectName(e.target.value)}", "value={newObjectName}\n                  onChange={val => setNewObjectName(val)}")

# Stats form
content = content.replace("<input\n                  value={editStatForm.label}\n                  onChange={(e) => setEditStatForm({...editStatForm, label: e.target.value})}", "<DebouncedInput\n                  value={editStatForm.label}\n                  onChange={(val) => setEditStatForm({...editStatForm, label: val})}")
content = content.replace("<input\n                  value={editStatForm.value}\n                  onChange={(e) => setEditStatForm({...editStatForm, value: e.target.value})}", "<DebouncedInput\n                  value={editStatForm.value}\n                  onChange={(val) => setEditStatForm({...editStatForm, value: val})}")
content = content.replace("<input\n                    value={editStatForm.trend}\n                    onChange={(e) => setEditStatForm({...editStatForm, trend: e.target.value})}", "<DebouncedInput\n                    value={editStatForm.trend}\n                    onChange={(val) => setEditStatForm({...editStatForm, trend: val})}")

with open('src/components/views/MainView.tsx', 'w') as f:
    f.write(content)

