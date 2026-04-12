import fs from 'fs';

let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const target = `<div className="bg-[#131313] rounded-md p-3 border border-[rgba(212,175,55,0.08)] relative overflow-hidden group">`;
const replacement = `<Link
          href="/pricing"
          style={{
            display: 'block',
            fontSize: '9px',
            fontFamily: 'monospace',
            letterSpacing: '0.12em',
            color: '#D4AF37',
            textDecoration: 'none',
            padding: '6px 12px',
            border: '1px solid rgba(212,175,55,0.3)',
            textAlign: 'center',
            marginBottom: '8px',
          }}
        >
          UPGRADE TIER
        </Link>

        <div className="bg-[#131313] rounded-md p-3 border border-[rgba(212,175,55,0.08)] relative overflow-hidden group">`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/Sidebar.tsx', content);
