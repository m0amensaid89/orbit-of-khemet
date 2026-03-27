import re

with open("src/lib/agents.ts", "r") as f:
    content = f.read()

# Update the type definition
old_type = """export type Agent = {
  id: string;
  name: string;
  category: string;
  role: string;
  desc: string;
};"""

new_type = """export type Agent = {
  id: string;
  name: string;
  category: string;
  role_summary: string;
  description: string;
  prompt?: string;
};"""

content = content.replace(old_type, new_type)

# Find and replace "role": and "desc": inside the agent definitions
# The quotes might be present since it's a JSON array representation
content = re.sub(r'"role"\s*:', '"role_summary":', content)
content = re.sub(r'"desc"\s*:', '"description":', content)

# If it's without quotes
content = re.sub(r'\brole\s*:', 'role_summary:', content)
content = re.sub(r'\bdesc\s*:', 'description:', content)

with open("src/lib/agents.ts", "w") as f:
    f.write(content)

with open("src/components/hero/AgentCommandCenter.tsx", "r") as f:
    acc_content = f.read()

acc_content = re.sub(r'agent\.role(?!\w)', 'agent.role_summary', acc_content)
acc_content = re.sub(r'agent\.desc(?!\w)', 'agent.description', acc_content)

with open("src/components/hero/AgentCommandCenter.tsx", "w") as f:
    f.write(acc_content)
