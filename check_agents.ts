import { heroAgents, heroMeta } from './src/lib/agents';

console.log("Thoren Agents Count:", heroAgents['thoren']?.length);
console.log("First Agent:", heroAgents['thoren']?.[0]);
console.log("Thoren Meta:", heroMeta['thoren']);
