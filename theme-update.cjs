const fs = require('fs');

function updateDashboardLayout() {
  const path = 'src/components/DashboardLayout.tsx';
  let content = fs.readFileSync(path, 'utf8');
  
  content = content
    .replace('bg-slate-50 font-sans text-slate-900', 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-sans text-slate-200')
    .replace('bg-blue-950 text-white p-4 flex items-center justify-between sticky top-0 z-20', 'bg-slate-800/80 backdrop-blur-xl border-b border-slate-700 text-white p-4 flex items-center justify-between sticky top-0 z-20')
    .replace('md:w-64 bg-blue-950 flex-col border-r border-blue-900 flex-shrink-0', 'md:w-64 bg-slate-800/80 backdrop-blur-xl flex-col border-r border-slate-700/50 flex-shrink-0 shadow-2xl')
    .replace('border-b border-blue-900', 'border-b border-slate-700/50')
    .replace('text-blue-300 text-[10px] uppercase tracking-tighter mt-0.5', 'text-cyan-400 text-[10px] uppercase tracking-tighter mt-0.5')
    .replace(/bg-blue-900 text-white border-l-4 border-blue-500 pl-5/g, 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-cyan-400 border-l-4 border-cyan-500 pl-5')
    .replace(/text-blue-200\/70 hover:bg-blue-900 hover:text-white/g, 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200')
    .replace('text-blue-400 bg-blue-900/30 hover:bg-blue-900 hover:text-white', 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 hover:text-amber-300')
    .replace('border-t border-blue-900 bg-blue-950/80', 'border-t border-slate-700/50 bg-slate-800/50')
    .replace('w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-xs border border-blue-500', 'w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs shadow-lg')
    .replace('text-blue-400 text-[10px]">Online', 'text-cyan-400 text-[10px]">Online')
    .replace('bg-blue-900 hover:bg-blue-800 rounded text-[11px] font-bold text-blue-200', 'bg-red-500/10 hover:bg-red-500/20 rounded text-[11px] font-bold text-red-400 border border-red-500/20')
    .replace('h-16 bg-white border-b border-slate-200', 'h-16 bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50')
    .replace('text-lg font-bold text-slate-800 uppercase tracking-tight', 'text-lg font-bold text-white uppercase tracking-tight')
    .replace('font-bold text-blue-900', 'font-bold text-cyan-400')
    .replace('bg-blue-900 text-white px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wider hover:bg-blue-800', 'bg-slate-700 text-slate-300 px-4 py-2 rounded text-[11px] font-bold uppercase tracking-wider hover:bg-slate-600')
    .replace('bg-blue-600 rounded flex items-center', 'bg-gradient-to-br from-blue-500 to-cyan-500 rounded flex items-center')
    .replace('text-blue-500" />', 'text-cyan-400" />')
    .replace(/text-blue-400\/50/g, 'text-slate-500');
    
  fs.writeFileSync(path, content);
}

function updateMainView() {
  const path = 'src/components/views/MainView.tsx';
  let content = fs.readFileSync(path, 'utf8');
  
  content = content
    .replace(/bg-white/g, 'bg-slate-800/80 backdrop-blur-xl')
    .replace(/border-slate-200/g, 'border-slate-700/50')
    .replace(/border-slate-100/g, 'border-slate-700/30')
    .replace(/shadow-sm/g, 'shadow-2xl shadow-black/20')
    .replace(/text-slate-800/g, 'text-white')
    .replace(/text-slate-600/g, 'text-slate-300')
    .replace(/text-slate-500/g, 'text-slate-400')
    .replace(/text-slate-400/g, 'text-slate-500')
    
    // Custom replacements for form inputs in MainView
    .replace(/bg-transparent/g, 'bg-transparent text-white')
    .replace(/bg-slate-100/g, 'bg-slate-700/50')
    .replace(/bg-slate-200/g, 'bg-slate-700/80')
    .replace(/bg-slate-50/g, 'bg-slate-800/50')
    
    // Green areas
    .replace(/bg-green-50/g, 'bg-emerald-500/10')
    .replace(/border-green-100/g, 'border-emerald-500/20')
    .replace(/text-green-700/g, 'text-emerald-400')
    .replace(/text-green-600/g, 'text-emerald-400')
    .replace(/bg-green-100/g, 'bg-emerald-500/20 text-emerald-400')
    
    // Blue accents
    .replace(/text-blue-600/g, 'text-cyan-400')
    .replace(/text-blue-500/g, 'text-cyan-400')
    .replace(/bg-blue-600/g, 'bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-500/50')
    .replace(/hover:bg-blue-700/g, 'hover:from-blue-700 hover:to-cyan-700')
    .replace(/bg-blue-500/g, 'bg-gradient-to-r from-blue-500 to-cyan-500')
    .replace(/bg-slate-200 h-1/g, 'bg-slate-700 h-1')
    
    // Hover states for list items
    .replace(/hover:bg-slate-50/g, 'hover:bg-slate-700/30');

  fs.writeFileSync(path, content);
}

function updateGeneralViews() {
  const views = ['FotView.tsx', 'ObjectsView.tsx', 'TasksView.tsx', 'AdminView.tsx', 'PlaceholderView.tsx'];
  views.forEach(view => {
    const path = `src/components/views/${view}`;
    if(fs.existsSync(path)) {
      let content = fs.readFileSync(path, 'utf8');
      
      content = content
        .replace(/bg-white/g, 'bg-slate-800/80 backdrop-blur-xl text-white')
        .replace(/bg-slate-50/g, 'bg-slate-900/50')
        .replace(/border-slate-200/g, 'border-slate-700/50')
        .replace(/border-slate-100/g, 'border-slate-700/30')
        .replace(/text-slate-800/g, 'text-white')
        .replace(/text-slate-900/g, 'text-white')
        .replace(/text-slate-600/g, 'text-slate-300')
        .replace(/text-slate-700/g, 'text-slate-300')
        .replace(/text-slate-500/g, 'text-slate-400')
        .replace(/bg-slate-100/g, 'bg-slate-700/50')
        .replace(/bg-slate-200/g, 'bg-slate-700')
        .replace(/hover:bg-slate-50/g, 'hover:bg-slate-700/30')
        .replace(/bg-blue-600/g, 'bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-500/50 text-white')
        .replace(/hover:bg-blue-700/g, 'hover:from-blue-700 hover:to-cyan-700')
        .replace(/bg-green-50/g, 'bg-emerald-500/10')
        .replace(/text-green-700/g, 'text-emerald-400')
        .replace(/text-green-600/g, 'text-emerald-400')
        .replace(/border-green-200/g, 'border-emerald-500/20')
        .replace(/bg-red-50/g, 'bg-red-500/10')
        .replace(/text-red-700/g, 'text-red-400')
        .replace(/text-red-600/g, 'text-red-400')
        .replace(/border-red-200/g, 'border-red-500/20')
        .replace(/bg-amber-50/g, 'bg-amber-500/10')
        .replace(/text-amber-700/g, 'text-amber-400')
        .replace(/border-amber-200/g, 'border-amber-500/20')
        .replace(/text-blue-600/g, 'text-cyan-400')
        .replace(/text-blue-500/g, 'text-cyan-400');
        
      fs.writeFileSync(path, content);
    }
  });
}

try {
  updateDashboardLayout();
  updateMainView();
  updateGeneralViews();
  console.log('Themes updated successfully');
} catch (e) {
  console.error(e);
}
