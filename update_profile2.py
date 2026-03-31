with open("src/app/profile/page.tsx", "r") as f:
    text = f.read()

state_vars_str = """
  const [stats, setStats] = useState({ totalEnergyUsed: 0, level: 1, currentXp: 0, nextLevelXp: 100 });
  const [userPlan, setUserPlan] = useState("explorer");
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);
  const [userData, setUserData] = useState<{ email?: string; name?: string; initials: string; energyBalance: number; messagesSent: number }>({ initials: "GO", energyBalance: 50, messagesSent: 0 });
"""

if "const [userData, setUserData]" not in text:
    text = text.replace('  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);', '  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);\n  const [userData, setUserData] = useState<{ email?: string; name?: string; initials: string; energyBalance: number; messagesSent: number }>({ initials: "GO", energyBalance: 50, messagesSent: 0 });')

text = text.replace('Level {stats.level} — Initiate', 'Level {stats.level} — {stats.level === 1 ? "Initiate" : stats.level === 2 ? "Scout" : stats.level === 3 ? "Agent" : stats.level === 4 ? "Operative" : stats.level === 5 ? "Commander" : stats.level === 6 ? "Architect" : "Grid Master"}')
text = text.replace('{Math.round(xpPercentage)}% complete</p>\n                  <p className="font-[Rajdhani] text-xs text-[#D4AF37]">{stats.nextLevelXp - stats.currentXp} XP to go</p>',
                    '{Math.round(xpPercentage)}% complete</p>\n                  <p className="font-[Rajdhani] text-xs text-[#D4AF37]">Total Messages: {userData.messagesSent} | {stats.nextLevelXp - stats.currentXp} XP to go</p>')

text = text.replace('span className="font-[Orbitron] text-[10px] tracking-[3px] uppercase text-white/40 mb-1">Next Rank: <span className="text-white">Scout</span>',
                    'span className="font-[Orbitron] text-[10px] tracking-[3px] uppercase text-white/40 mb-1">Next Rank: <span className="text-white">{stats.level === 1 ? "Scout" : stats.level === 2 ? "Agent" : stats.level === 3 ? "Operative" : stats.level === 4 ? "Commander" : stats.level === 5 ? "Architect" : "Grid Master"}</span>')


with open("src/app/profile/page.tsx", "w") as f:
    f.write(text)
