import re

with open("src/components/Sidebar.tsx", "r") as f:
    content = f.read()

# Make sure we only setEnergy when typeof data.credits === 'number'
content = content.replace("if (data && data.credits !== undefined) {", "if (data && typeof data.credits === 'number') {")

with open("src/components/Sidebar.tsx", "w") as f:
    f.write(content)
