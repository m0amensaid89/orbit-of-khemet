import fs from 'fs';

let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// The original import might be missing 'Link'
if (!content.includes('import Link from "next/link"')) {
    // Add import
    content = 'import Link from "next/link";\n' + content;
    fs.writeFileSync('src/components/Sidebar.tsx', content);
}
