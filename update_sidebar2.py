import re

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

# Try again to replace state vars properly (didn't match last time)
state_vars = """  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState<Array<{id: string, name: string, color: string}>>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');"""

if "const [projects, setProjects]" not in content:
    content = re.sub(r'const \[isMobileMenuOpen, setIsMobileMenuOpen\] = useState\(false\);', state_vars, content)

# Try again to add hooks
hooks_and_handlers = """
  // Update local credits on standard window events
  useEffect(() => {
    const handleUpdate = () => {
      fetchCredits();
    };

    window.addEventListener('credits-updated', handleUpdate);
    return () => window.removeEventListener('credits-updated', handleUpdate);
  }, []);

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
"""

if "fetchProjects" not in content:
    content = re.sub(r"  // Update local credits on standard window events\n  useEffect\(\(\) => \{\n    const handleUpdate = \(\) => \{\n      fetchCredits\(\);\n    \};\n\n    window\.addEventListener\('credits-updated', handleUpdate\);\n    return \(\) => window\.removeEventListener\('credits-updated', handleUpdate\);\n  \}, \[\]\);", hooks_and_handlers, content)

projects_ui = """
        {/* PROJECTS SECTION */}
        <div style={{ padding: '0 12px', marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <span style={{
              fontSize: '9px',
              letterSpacing: '0.14em',
              color: 'rgba(212,175,55,0.5)',
              fontFamily: 'monospace',
            }}>PROJECTS</span>
            <button
              onClick={() => setShowNewProject(true)}
              style={{
                fontSize: '14px',
                color: '#D4AF37',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >+</button>
          </div>

          {/* Project list */}
          {projects.map(p => (
            <div key={p.id}
              onClick={() => setSelectedProject(p.id)}
              style={{
                padding: '6px 8px',
                marginBottom: '2px',
                cursor: 'pointer',
                borderLeft: selectedProject === p.id
                  ? `2px solid ${p.color || '#D4AF37'}`
                  : '2px solid transparent',
                fontSize: '11px',
                color: selectedProject === p.id ? '#fff' : 'rgba(255,255,255,0.5)',
                fontFamily: 'monospace',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              ✦ {p.name}
            </div>
          ))}

          {/* New project modal */}
          {showNewProject && (
            <div style={{
              background: '#111',
              border: '1px solid rgba(212,175,55,0.3)',
              padding: '12px',
              marginTop: '8px',
            }}>
              <input
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                placeholder="Project name..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(212,175,55,0.3)',
                  color: '#fff',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  padding: '4px 0',
                  marginBottom: '8px',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={handleCreateProject}
                  style={{
                    flex: 1,
                    padding: '4px',
                    background: 'transparent',
                    border: '1px solid #D4AF37',
                    color: '#D4AF37',
                    fontSize: '9px',
                    fontFamily: 'monospace',
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                  }}
                >CREATE</button>
                <button
                  onClick={() => setShowNewProject(false)}
                  style={{
                    flex: 1,
                    padding: '4px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '9px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                  }}
                >CANCEL</button>
              </div>
            </div>
          )}
        </div>

        {/* MISSION LOG Section */}
"""

content = re.sub(r'        \{\/\* MISSION LOG Section \*\/\}\n', projects_ui, content)

with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)
