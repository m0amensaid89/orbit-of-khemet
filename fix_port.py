import re

with open('verify_hero_page.py', 'r') as f:
    content = f.read()

content = content.replace('http://localhost:3001/heroes/thoren', 'http://localhost:3005/heroes/thoren')

with open('verify_hero_page.py', 'w') as f:
    f.write(content)
