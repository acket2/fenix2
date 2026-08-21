with open('src/components/views/ActiveObjectCard.tsx', 'r') as f:
    content = f.read()

old_str = """                  <div className={`font-semibold ${((obj.closingAmount || 0) - (obj.costAmount || 0)) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {((obj.closingAmount || 0) - (obj.costAmount || 0)).toLocaleString('ru-RU')} ₽
                  </div>"""

new_str = """                  <div className={`font-semibold flex items-baseline gap-1 whitespace-nowrap overflow-hidden text-ellipsis ${((obj.closingAmount || 0) - (obj.costAmount || 0)) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {((obj.closingAmount || 0) - (obj.costAmount || 0)).toLocaleString('ru-RU')} <span className="text-[10px] opacity-50">₽</span>
                  </div>"""

content = content.replace(old_str, new_str)

with open('src/components/views/ActiveObjectCard.tsx', 'w') as f:
    f.write(content)
print("done")
