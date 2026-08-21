import os

code_plans = """import React from 'react';

export default function PlansView() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-6">Планирование</h2>
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center text-slate-400">
        Раздел планирования пуст.
      </div>
    </div>
  );
}
"""

code_docs = """import React from 'react';

export default function DocsView() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-6">Документы</h2>
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center text-slate-400">
        Список документов пуст.
      </div>
    </div>
  );
}
"""

with open("src/components/views/PlansView.tsx", "w", encoding="utf-8") as f:
    f.write(code_plans)

with open("src/components/views/DocsView.tsx", "w", encoding="utf-8") as f:
    f.write(code_docs)

print("Created empty views")
