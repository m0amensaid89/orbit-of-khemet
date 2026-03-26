const fs = require('fs');
const html = fs.readFileSync('src/data/igamify_hero_page_v2_agents.html', 'utf8');

const match = html.match(/const HERO_META = (\{[\s\S]*?\});\n\nconst heroOrder/);
if (match) {
  let heroMetaStr = match[1];
  const script = `
    const HERO_META = ${heroMetaStr};
    console.log(JSON.stringify(HERO_META, null, 2));
  `;
  fs.writeFileSync('temp_eval.js', script);
}
