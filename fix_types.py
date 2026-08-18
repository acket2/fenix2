import re

with open('src/components/views/FotView.tsx', 'r') as f:
    content = f.read()

bad_def = """const DebouncedInput = ({ value, onChange, className, type = "text", placeholder = "", style = {} }) => {"""
good_def = """const DebouncedInput = ({ value, onChange, className, type = "text", placeholder = "", style = {} }: { value: any, onChange: (val: any) => void, className?: string, type?: string, placeholder?: string, style?: any }) => {"""

content = content.replace(bad_def, good_def)

# Also fix the event type for handleKeyDown and onChange
bad_input = """      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}"""
good_input = """      onChange={(e: any) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e: any) => {
        if (e.key === 'Enter') e.target.blur();
      }}"""
content = content.replace(bad_input, good_input)

# Wait, handleKeyDown is still defined above. Let's just remove the original handleKeyDown
content = re.sub(r'  const handleKeyDown = \(e\) => \{.*?\};', '', content, flags=re.DOTALL)

with open('src/components/views/FotView.tsx', 'w') as f:
    f.write(content)
