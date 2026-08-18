import re

with open('src/components/views/FotView.tsx', 'r') as f:
    content = f.read()

# Add DebouncedInput component at the top
debounced_component = """
const DebouncedInput = ({ value, onChange, className, type = "text", placeholder = "", style = {} }) => {
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <input
      type={type}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={className}
      placeholder={placeholder}
      style={style}
    />
  );
};
"""

# Insert it after the imports
content = content.replace("export default function FotView", debounced_component + "\nexport default function FotView")

# Replace workerName input
content = content.replace("""                        <input 
                          value={record.workerName} 
                          onChange={(e) => handleNameChange(record, e.target.value)}""", """                        <DebouncedInput 
                          value={record.workerName} 
                          onChange={(val) => handleNameChange(record, val)}""")

# Replace dailyRate input
content = content.replace("""                        <input 
                          type="number"
                          value={record.dailyRate || DEFAULT_RATE} 
                          onChange={(e) => handleRateChange(record, parseInt(e.target.value) || 0)}""", """                        <DebouncedInput 
                          type="number"
                          value={record.dailyRate || DEFAULT_RATE} 
                          onChange={(val) => handleRateChange(record, parseInt(val) || 0)}""")

# Replace paidAmount input
content = content.replace("""                        <input 
                          type="number"
                          value={record.paidAmount || ''}
                          onChange={(e) => handlePaidChange(record, parseInt(e.target.value) || 0)}""", """                        <DebouncedInput 
                          type="number"
                          value={record.paidAmount || ''}
                          onChange={(val) => handlePaidChange(record, parseInt(val) || 0)}""")

# Replace owed input (which uses onchange with a block)
owed_search = """                        <input 
                          type="number"
                          value={owed || ''}
                          onChange={(e) => {
                            const newOwed = parseInt(e.target.value) || 0;
                            handlePaidChange(record, totalEarned - newOwed);
                          }}"""
owed_replace = """                        <DebouncedInput 
                          type="number"
                          value={owed || ''}
                          onChange={(val) => {
                            const newOwed = parseInt(val) || 0;
                            handlePaidChange(record, totalEarned - newOwed);
                          }}"""
content = content.replace(owed_search, owed_replace)

with open('src/components/views/FotView.tsx', 'w') as f:
    f.write(content)
