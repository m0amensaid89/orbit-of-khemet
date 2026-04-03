import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# I need to add the font class to the <p> tags inside the hero boxes.
# Also fix the <div> which has font-[family-name:var(--font-roboto)] to remove it from there if not needed,
# or just add to the p tags explicitly.
