import re

with open('src/components/views/TasksView.tsx', 'r') as f:
    content = f.read()

# Add DebouncedInput to TasksView
if 'const DebouncedInput =' not in content:
    debounced_component = """
const DebouncedInput = ({ value, onChange, className, type = "text", placeholder = "", style = {}, autoFocus = false }: { value: any, onChange: (val: any) => void, className?: string, type?: string, placeholder?: string, style?: any, autoFocus?: boolean }) => {
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
      autoFocus={autoFocus}
    />
  );
};
"""
    content = content.replace("export default function TasksView", debounced_component + "\nexport default function TasksView")

# Replace input
content = re.sub(
    r'<input\s+value=\{editForm\}\s+onChange=\{e => setEditForm\(e.target.value\)\}\s+className="([^"]+)"\s+autoFocus\s+/>',
    r'<DebouncedInput value={editForm} onChange={val => setEditForm(val)} className="\1" autoFocus={true} />',
    content,
    flags=re.MULTILINE | re.DOTALL
)

with open('src/components/views/TasksView.tsx', 'w') as f:
    f.write(content)

