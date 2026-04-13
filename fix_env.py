import re

with open('src/app/api/projects/route.ts', 'r') as f:
    content = f.read()

# Replace throwing empty strings for Supabase URL and Key if undefined to avoid build-time errors
content = content.replace(
    'process.env.NEXT_PUBLIC_SUPABASE_URL!',
    'process.env.NEXT_PUBLIC_SUPABASE_URL || ""'
).replace(
    'process.env.SUPABASE_SERVICE_ROLE_KEY!',
    'process.env.SUPABASE_SERVICE_ROLE_KEY || ""'
)

with open('src/app/api/projects/route.ts', 'w') as f:
    f.write(content)
