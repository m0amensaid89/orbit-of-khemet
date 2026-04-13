import re

with open('src/app/auth/callback/route.ts', 'r') as f:
    content = f.read()

# Replace the redirect from / to /hub
content = content.replace("return NextResponse.redirect(`${origin}/`);", "return NextResponse.redirect(`${origin}/hub`);")

with open('src/app/auth/callback/route.ts', 'w') as f:
    f.write(content)
