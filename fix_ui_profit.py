import re

with open('src/components/views/ActiveObjectCard.tsx', 'r') as f:
    content = f.read()

# Fix the regex pattern
profit_pattern = r'<div className=\{`font-semibold \$\{.*?\}`\}>\s*\{.*?\((obj\.closingAmount \|\| 0\) - \(obj\.costAmount \|\| 0\)\)\.toLocaleString\(\'ru-RU\'\)\} ₽\s*</div>'
profit_replacement = r'<div className={`font-semibold flex items-baseline gap-1 whitespace-nowrap overflow-hidden text-ellipsis ${((obj.closingAmount || 0) - (obj.costAmount || 0)) < 0 ? \'text-red-400\' : \'text-emerald-400\'}`}>{((obj.closingAmount || 0) - (obj.costAmount || 0)).toLocaleString(\'ru-RU\')} <span className="text-[10px] opacity-50">₽</span></div>'

try:
    content = re.sub(profit_pattern, profit_replacement, content)
    with open('src/components/views/ActiveObjectCard.tsx', 'w') as f:
        f.write(content)
    print("Profit replaced with regex")
except Exception as e:
    print("Regex failed:", e)
    # Fallback to string replace
    old_str = '<div className={`font-semibold ${((obj.closingAmount || 0) - (obj.costAmount || 0)) < 0 ? \'text-red-400\' : \'text-emerald-400\'}`}>\n                    {((obj.closingAmount || 0) - (obj.costAmount || 0)).toLocaleString(\'ru-RU\')} ₽\n                  </div>'
    new_str = '<div className={`font-semibold flex items-baseline gap-1 whitespace-nowrap overflow-hidden text-ellipsis ${((obj.closingAmount || 0) - (obj.costAmount || 0)) < 0 ? \'text-red-400\' : \'text-emerald-400\'}`}>\n                    {((obj.closingAmount || 0) - (obj.costAmount || 0)).toLocaleString(\'ru-RU\')} <span className="text-[10px] opacity-50">₽</span>\n                  </div>'
    content = content.replace(old_str, new_str)
    
    with open('src/components/views/ActiveObjectCard.tsx', 'w') as f:
        f.write(content)
    print("Profit replaced with string match")
