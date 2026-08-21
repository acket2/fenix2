with open("src/utils/storage.ts", "r", encoding="utf-8") as f:
    lines = f.readlines()

out = []
for line in lines:
    if "import { storage }" in line and "Duplicate" not in line:
        continue
    if "import { ref, uploadBytes, getDownloadURL }" in line:
        continue
    out.append(line)

with open("src/utils/storage.ts", "w", encoding="utf-8") as f:
    f.writelines(out)
