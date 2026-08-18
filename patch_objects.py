import re

with open('src/components/views/ObjectsView.tsx', 'r') as f:
    content = f.read()

# Add DebouncedInput to ObjectsView if not exists
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
    content = content.replace("export default function ObjectsView", debounced_component + "\nexport default function ObjectsView")

# Replace inputs with DebouncedInput
content = content.replace("<input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className=", "<DebouncedInput value={editForm.name} onChange={val => setEditForm({...editForm, name: val})} className=")
content = content.replace("<input value={editForm.customer} onChange={e => setEditForm({...editForm, customer: e.target.value})} className=", "<DebouncedInput value={editForm.customer} onChange={val => setEditForm({...editForm, customer: val})} className=")
content = content.replace("<input type=\"number\" value={editForm.contractAmount} onChange={e => setEditForm({...editForm, contractAmount: parseInt(e.target.value)||0})} className=", "<DebouncedInput type=\"number\" value={editForm.contractAmount} onChange={val => setEditForm({...editForm, contractAmount: parseInt(val)||0})} className=")
content = content.replace("<input type=\"number\" value={editForm.costAmount} onChange={e => setEditForm({...editForm, costAmount: parseInt(e.target.value)||0})} className=", "<DebouncedInput type=\"number\" value={editForm.costAmount} onChange={val => setEditForm({...editForm, costAmount: parseInt(val)||0})} className=")
content = content.replace("<input type=\"number\" value={editForm.closingAmount} onChange={e => setEditForm({...editForm, closingAmount: parseInt(e.target.value)||0})} className=", "<DebouncedInput type=\"number\" value={editForm.closingAmount} onChange={val => setEditForm({...editForm, closingAmount: parseInt(val)||0})} className=")

with open('src/components/views/ObjectsView.tsx', 'w') as f:
    f.write(content)

