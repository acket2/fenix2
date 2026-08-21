with open('vite.config.ts', 'r') as f:
    content = f.read()

content = content.replace("base: './', // Добавлено для GitHub Pages", "base: '/fenix2/', // Fix for GitHub Pages")

with open('vite.config.ts', 'w') as f:
    f.write(content)
