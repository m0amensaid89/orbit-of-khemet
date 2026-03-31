with open("src/app/profile/page.tsx", "r") as f:
    text = f.read()

# Add auth imports
import_str = 'import { createClient } from "@/lib/supabase/client";'
if import_str not in text:
    text = text.replace('import { motion } from "framer-motion";', f'import {{ motion }} from "framer-motion";\n{import_str}')


# Add state variables for user info
state_vars = """
  const [stats, setStats] = useState({ totalEnergyUsed: 0, level: 1, currentXp: 0, nextLevelXp: 100 });
  const [userPlan, setUserPlan] = useState("explorer");
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);
  const [userData, setUserData] = useState<{ email?: string; name?: string; initials: string; energyBalance: number; messagesSent: number }>({ initials: "GO", energyBalance: 50, messagesSent: 0 });
"""
if "const [userData, setUserData]" not in text:
    text = text.replace('  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);', '  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([]);\n  const [userData, setUserData] = useState<{ email?: string; name?: string; initials: string; energyBalance: number; messagesSent: number }>({ initials: "GO", energyBalance: 50, messagesSent: 0 });')


effect = """
  useEffect(() => {
    const liveStats = getStats();
    setStats({
      totalEnergyUsed: liveStats.messages * 2,
      level: liveStats.level,
      currentXp: liveStats.xp,
      nextLevelXp: liveStats.nextLevelXP,
    });
    const savedPlan = localStorage.getItem("orbit_plan") || "scout"; // Defaulting to scout
    setUserPlan(savedPlan);
    setCustomAgents(getCustomAgents());

    const fetchUserData = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('energy_balance, display_name').eq('id', session.user.id).single();
        const email = session.user.email;
        const name = profile?.display_name || email?.split('@')[0] || "Grid Operative";
        const initials = name.substring(0, 2).toUpperCase();
        setUserData({
          email,
          name,
          initials,
          energyBalance: profile?.energy_balance ?? getEnergyRemaining(),
          messagesSent: liveStats.messages
        });
      } else {
        setUserData(prev => ({ ...prev, energyBalance: getEnergyRemaining(), messagesSent: liveStats.messages }));
      }
    };
    fetchUserData();
  }, []);
"""

start_idx = text.find('  useEffect(() => {')
end_idx = text.find('  }, []);', start_idx) + 9

if start_idx != -1 and end_idx != -1:
    text = text[:start_idx] + effect + text[end_idx:]

# Update the display name and initials
text = text.replace('''              <div className="w-32 h-32 rounded-full border-4 border-[#1A1A1A] flex items-center justify-center font-[Orbitron] text-4xl font-black bg-[#131313] text-[#D4AF37] relative z-10 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                GO
              </div>''',
'''              <div className="w-32 h-32 rounded-full border-4 border-[#1A1A1A] flex items-center justify-center font-[Orbitron] text-4xl font-black bg-[#131313] text-[#D4AF37] relative z-10 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                {userData.initials}
              </div>''')

text = text.replace('''              <h1 className="text-4xl md:text-5xl font-[Orbitron] font-black tracking-wider mb-3 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                Grid Operative
              </h1>''',
'''              <h1 className="text-4xl md:text-5xl font-[Orbitron] font-black tracking-wider mb-3 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] truncate max-w-md">
                {userData.name}
              </h1>
              {userData.email && (
                <p className="font-[Rajdhani] text-sm text-white/50 mb-3 -mt-2 truncate max-w-md">{userData.email}</p>
              )}''')


text = text.replace('''                  <span className="font-[Orbitron] font-bold text-xs text-[#D4AF37]">
                    {getEnergyRemaining().toLocaleString()} <span className="text-white/30">/ {getMaxEnergy().toLocaleString()}</span>
                  </span>''',
'''                  <span className="font-[Orbitron] font-bold text-xs text-[#D4AF37]">
                    {userData.energyBalance.toLocaleString()} <span className="text-white/30">/ {getMaxEnergy().toLocaleString()}</span>
                  </span>''')

text = text.replace('''                    animate={{ width: `${Math.round((getEnergyRemaining() / getMaxEnergy()) * 100)}%` }}''',
                    '''                    animate={{ width: `${Math.round((userData.energyBalance / getMaxEnergy()) * 100)}%` }}''')

text = text.replace('''                      background: getEnergyRemaining() / getMaxEnergy() <= 0.2 ? "linear-gradient(90deg, #991b1b, #ef4444)" :
                                  getEnergyRemaining() / getMaxEnergy() <= 0.5 ? "linear-gradient(90deg, #92400e, #f59e0b)" :
                                  "linear-gradient(90deg, #D4AF37, #FFD700)",
                      boxShadow: getEnergyRemaining() / getMaxEnergy() > 0.5 ? "0 0 10px rgba(212,175,55,0.8)" : "none"''',
'''                      background: userData.energyBalance / getMaxEnergy() <= 0.2 ? "linear-gradient(90deg, #991b1b, #ef4444)" :
                                  userData.energyBalance / getMaxEnergy() <= 0.5 ? "linear-gradient(90deg, #92400e, #f59e0b)" :
                                  "linear-gradient(90deg, #D4AF37, #FFD700)",
                      boxShadow: userData.energyBalance / getMaxEnergy() > 0.5 ? "0 0 10px rgba(212,175,55,0.8)" : "none"''')


btn_str = '''                <Link href="/pricing" className="block w-full mt-4">
                  <button className="w-full font-[Orbitron] text-[10px] tracking-[3px] uppercase px-4 py-3 font-bold rounded-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #f2ca50, #D4AF37)", color: "#0a0a0a", boxShadow: "0 0 15px rgba(212,175,55,0.3)" }}>
                    TOP UP ENERGY →
                  </button>
                </Link>'''

text = text.replace('                <p className="font-[Rajdhani] text-[10px] text-white/40 mt-2 text-right">Resets daily at midnight UTC</p>\n              </div>',
f'                <p className="font-[Rajdhani] text-[10px] text-white/40 mt-2 text-right">Resets daily at midnight UTC</p>\n{btn_str}\n              </div>')


with open("src/app/profile/page.tsx", "w") as f:
    f.write(text)
