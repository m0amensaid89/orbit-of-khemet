const fs = require('fs');

const heroMetaRaw = fs.readFileSync('hero_meta.json', 'utf8');
const HERO_META = JSON.parse(heroMetaRaw);

let heroesTs = fs.readFileSync('src/lib/heroes.ts', 'utf8');

for (const [key, meta] of Object.entries(HERO_META)) {
    const philosophy = meta.philosophy || "";

    // Create the TS connection object
    const rawConnections = meta.connections || [];
    const formattedConnections = rawConnections.map(c => ({
        hero: c.name,
        slug: c.name.toLowerCase(),
        class: c.class,
        relation: c.rel,
        workflow: c.workflow,
        agent_count: c.agents
    }));

    const connections = JSON.stringify(formattedConnections);

    // Replace suit_philosophy correctly
    // It's currently "suit_philosophy": ""
    const regex = new RegExp(`("${key}"\\s*:\\s*\\{[\\s\\S]*?"suit_philosophy"\\s*:\\s*)""`, 'g');
    heroesTs = heroesTs.replace(regex, `$1${JSON.stringify(philosophy)}`);

    // Replace connections correctly
    // It's currently "connections": []
    const connRegex = new RegExp(`("${key}"\\s*:\\s*\\{[\\s\\S]*?"connections"\\s*:\\s*)\\[\\]`, 'g');
    heroesTs = heroesTs.replace(connRegex, `$1${connections}`);
}

fs.writeFileSync('src/lib/heroes.ts', heroesTs);
console.log("Updated heroes.ts");
