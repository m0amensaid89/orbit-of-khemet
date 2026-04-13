import re

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

# 1. Add state variables
state_vars = """  const [threadSearch, setThreadSearch] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [projects, setProjects] = useState<Array<{id: string, name: string, color: string}>>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');"""

if "const [projects, setProjects]" not in content:
    content = re.sub(r'  const \[threadSearch, setThreadSearch\] = useState\(\'\'\);\n  const \[renamingId, setRenamingId\] = useState<string \| null>\(null\);\n  const \[renameValue, setRenameValue\] = useState\(\'\'\);\n  const \[isRenaming, setIsRenaming\] = useState\(false\);', state_vars, content)

# 2. Add useEffect and handler
hooks_and_handlers = """
  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch('/api/projects')
      const data = await res.json()
      if (data.projects) setProjects(data.projects)
    }
    fetchProjects()
  }, [])

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProjectName, color: '#D4AF37' }),
    })
    const data = await res.json()
    if (data.project) {
      setProjects(prev => [data.project, ...prev])
      setNewProjectName('')
      setShowNewProject(false)
    }
  }

  const supabase = createClient();
"""

if "fetchProjects" not in content:
    content = re.sub(r"  const supabase = createClient\(\);", hooks_and_handlers, content)

with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)
