const fs = require('fs');

let content = fs.readFileSync('src/app/chat/[hero]/chat-client.tsx', 'utf8');

const target = `
  useEffect(() => {
    if (!agent || messages.length > 0) return
    const openingContent = \`\${agent.name} ready. How can I help?\`

    if (agentParam && heroParam) {
      const skillKey = \`\${heroParam.toLowerCase()}-\${agentParam}\`
      const skill = agentSkills[skillKey]
      if (skill) {
        const timer = setTimeout(() => {
          const username = profileRef.current?.display_name
            || profileRef.current?.full_name
            || profileRef.current?.username
            || userRef.current?.email?.split('@')[0]
            || 'Commander'

          if (!skill?.openingMessage) return

          const opening = skill.openingMessage(username)
          let i = 0
          setTypewriterText('')
          setTypewriterDone(false)

          const interval = setInterval(() => {
            if (i < opening.length) {
              setTypewriterText(opening.slice(0, i + 1))
              i++
            } else {
              setTypewriterDone(true)
              clearInterval(interval)
            }
          }, 18)

          return () => clearInterval(interval)
        }, 1800)

        return () => clearTimeout(timer)
      }
    }

    let i = 0
    setTypewriterText('')
    setTypewriterDone(false)
    const interval = setInterval(() => {
      if (i < openingContent.length) {
        setTypewriterText(openingContent.slice(0, i + 1))
        i++
      } else {
        setTypewriterDone(true)
        clearInterval(interval)
      }
    }, 18)
    return () => clearInterval(interval)
  }, [agent?.id, agent?.name, agentParam, heroParam, messages.length])
`;

const replacement = `
  useEffect(() => {
    if (!agent || messages.length > 0) return

    const username = profileRef.current?.display_name
      || profileRef.current?.full_name
      || profileRef.current?.username
      || userRef.current?.email?.split('@')[0]
      || 'Commander'

    const openingContent = \`Hello \${username} I am \${agent.name} How can I help.\`

    if (agentParam && heroParam) {
      const skillKey = \`\${heroParam.toLowerCase()}-\${agentParam}\`
      const skill = agentSkills[skillKey]
      if (skill) {
        const timer = setTimeout(() => {
          if (!skill?.openingMessage) return

          const opening = skill.openingMessage(username)
          let i = 0
          setTypewriterText('')
          setTypewriterDone(false)

          const interval = setInterval(() => {
            if (i < opening.length) {
              setTypewriterText(opening.slice(0, i + 1))
              i++
            } else {
              setTypewriterDone(true)
              clearInterval(interval)
            }
          }, 18)

          return () => clearInterval(interval)
        }, 1800)

        return () => clearTimeout(timer)
      }
    }

    const timer = setTimeout(() => {
      let i = 0
      setTypewriterText('')
      setTypewriterDone(false)
      const interval = setInterval(() => {
        if (i < openingContent.length) {
          setTypewriterText(openingContent.slice(0, i + 1))
          i++
        } else {
          setTypewriterDone(true)
          clearInterval(interval)
        }
      }, 18)
      return () => clearInterval(interval)
    }, 1800)

    return () => clearTimeout(timer)
  }, [agent?.id, agent?.name, agentParam, heroParam, messages.length])
`;

if (content.includes(target.trim())) {
    content = content.replace(target.trim(), replacement.trim());
    fs.writeFileSync('src/app/chat/[hero]/chat-client.tsx', content);
    console.log("Success");
} else {
    console.log("Failed to find target");
}
