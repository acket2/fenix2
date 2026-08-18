import os
import glob

# Search recursively for .tsx files
files = glob.glob('src/**/*.tsx', recursive=True)

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Replace expensive backdrop-blur-xl with a simple background for better performance
    # bg-slate-800/80 backdrop-blur-xl -> bg-slate-800
    # Let's just remove backdrop-blur-xl and backdrop-blur-md everywhere
    new_content = content.replace(' backdrop-blur-xl', '')
    new_content = new_content.replace(' backdrop-blur-md', '')
    new_content = new_content.replace(' backdrop-blur-sm', '')
    
    if new_content != content:
        with open(file, 'w') as f:
            f.write(new_content)
