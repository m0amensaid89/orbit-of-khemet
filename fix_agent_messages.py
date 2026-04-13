import re

with open('src/lib/agent-skills/index.ts', 'r') as f:
    content = f.read()

def get_capability(title):
    title_lower = title.lower()
    if 'excel' in title_lower:
        return 'build powerful spreadsheets, automate data analysis, and create financial models'
    elif 'contract' in title_lower:
        return 'review agreements, flag risks, redline contracts, and draft protective clauses across EMEA and Africa'
    elif 'ad copy' in title_lower or 'copy strategist' in title_lower:
        return 'craft precision-targeted copy that converts and optimizes ad spend'
    elif 'persona' in title_lower:
        return 'develop deeply researched buyer personas and target audience profiles'
    elif 'affiliate' in title_lower:
        return 'design scalable affiliate marketing programs and partner strategies'
    elif 'character' in title_lower:
        return 'flesh out compelling character arcs and rich backstories'
    elif 'story' in title_lower:
        return 'structure engaging narratives and optimize story pacing'
    elif 'finance' in title_lower or 'financial' in title_lower:
        return 'analyze financial statements, optimize cash flows, and build robust financial models'
    elif 'tech architect' in title_lower or 'systems architect' in title_lower:
        return 'design scalable software architectures and optimize engineering workflows'
    elif 'brand' in title_lower:
        return 'protect and build your brand identity with strategic market positioning'
    elif 'e-commerce' in title_lower:
        return 'optimize your e-commerce operations and maximize store conversion rates'
    elif 'cv' in title_lower:
        return 'craft compelling CVs that highlight your strengths and pass ATS filters'
    elif 'interview' in title_lower:
        return 'prepare you for high-stakes interviews with targeted practice and feedback'
    elif 'blog' in title_lower:
        return 'write engaging, SEO-optimized blog posts that drive organic traffic'
    elif 'marketing' in title_lower:
        return 'develop comprehensive marketing campaigns and growth strategies'
    elif 'research' in title_lower:
        return 'conduct deep market research to uncover actionable industry insights'
    elif 'sales' in title_lower:
        return 'simulate complex sales scenarios to refine your pitch and closing techniques'
    elif 'funnel' in title_lower:
        return 'architect high-converting sales funnels that maximize customer lifetime value'
    elif 'community' in title_lower:
        return 'build and scale highly engaged online communities around your brand'
    elif 'leadership' in title_lower:
        return 'develop your executive presence and refine your leadership strategies'
    elif 'course' in title_lower:
        return 'design comprehensive curriculum and engaging course materials'
    elif 'assistant' in title_lower:
        return 'streamline your daily operations and handle complex administrative workflows'
    elif 'email' in title_lower:
        return 'craft cold email campaigns and newsletters that drive high open and reply rates'
    elif 'seo' in title_lower:
        return 'optimize your content to dominate search engine rankings'
    elif 'book' in title_lower:
        return 'structure your manuscript and guide you through the publishing process'
    elif 'grammar' in title_lower or 'rewriting' in title_lower:
        return 'polish your prose with expert grammar correction and stylistic rewriting'
    elif 'metrics' in title_lower or 'analyst' in title_lower:
        return 'analyze complex datasets and build actionable performance dashboards'
    elif 'success' in title_lower or 'support' in title_lower or 'service' in title_lower:
        return 'optimize customer success workflows and resolve support escalations'
    elif 'partnership' in title_lower:
        return 'identify and negotiate strategic business partnerships'
    elif 'short-form' in title_lower or 'shorts' in title_lower:
        return 'script and optimize highly engaging short-form video content'
    elif 'repurposer' in title_lower:
        return 'transform long-form content into viral, multi-platform social assets'
    elif 'facebook' in title_lower:
        return 'scale your Facebook ad campaigns and organic page growth'
    elif 'instagram' in title_lower:
        return 'grow your Instagram following and optimize grid engagement'
    elif 'social' in title_lower:
        return 'manage and scale your social media presence across multiple platforms'
    elif 'hook' in title_lower:
        return 'write scroll-stopping hooks that capture immediate audience attention'
    elif 'podcast' in title_lower:
        return 'plan your podcast episodes, draft scripts, and map out interview questions'
    elif 'subject line' in title_lower:
        return 'craft irresistible email subject lines that guarantee high open rates'
    elif 'presentation' in title_lower:
        return 'design persuasive presentations and compelling pitch decks'
    elif 'summarization' in title_lower:
        return 'distill long documents into clear, actionable executive summaries'
    elif 'landing page' in title_lower:
        return 'write high-converting landing page copy that drives immediate action'
    elif 'youtube' in title_lower:
        return 'script engaging YouTube videos optimized for retention and growth'
    elif 'twitter' in title_lower or 'x/' in title_lower:
        return 'craft viral threads and optimize your Twitter/X growth strategy'
    elif 'content' in title_lower:
        return 'develop end-to-end content plans and multi-channel editorial calendars'
    elif 'creator' in title_lower:
        return 'build robust digital creation strategies to monetize your audience'
    elif 'pitch' in title_lower:
        return 'refine your business pitch to secure funding and close major deals'
    elif 'pricing' in title_lower:
        return 'analyze market dynamics to optimize your product pricing strategy'
    elif 'list' in title_lower:
        return 'implement high-growth lead generation and email list building tactics'
    elif 'prioritizer' in title_lower or 'productivity' in title_lower:
        return 'optimize your workflow and prioritize high-leverage tasks for maximum output'
    elif 'remote' in title_lower:
        return 'build effective remote work systems and optimize distributed team collaboration'
    elif 'crm' in title_lower:
        return 'architect scalable CRM systems to better manage your customer relationships'
    elif 'logo' in title_lower:
        return 'conceptualize strong logo designs and cohesive visual brand identities'
    elif 'life coach' in title_lower:
        return 'guide your personal development journey and help you overcome mental blockers'
    elif 'segmentation' in title_lower:
        return 'segment your customer database for hyper-targeted marketing campaigns'
    elif 'product' in title_lower:
        return 'guide your product development lifecycle from ideation to successful launch'
    elif 'legal' in title_lower:
        return 'navigate complex compliance requirements and build strong legal frameworks'
    elif 'people' in title_lower or 'hr' in title_lower:
        return 'optimize your HR operations, talent acquisition, and employee retention'
    elif 'linkedin' in title_lower:
        return 'build your professional brand and drive B2B lead generation on LinkedIn'
    elif 'offer' in title_lower:
        return 'craft irresistible business offers that make saying no feel foolish'
    elif 'negotiation' in title_lower:
        return 'prepare you for high-stakes business negotiations and deal structuring'
    elif 'onboarding' in title_lower:
        return 'design frictionless user onboarding experiences that drive immediate product adoption'
    elif 'innovation' in title_lower:
        return 'foster creative problem solving and guide your business innovation strategy'
    elif 'risk' in title_lower:
        return 'identify potential business liabilities and develop robust risk mitigation plans'
    elif 'operator' in title_lower:
        return 'streamline your daily business operations and eliminate workflow bottlenecks'
    elif 'exit' in title_lower:
        return 'prepare your business for a lucrative acquisition or strategic exit event'
    else:
        return 'deliver world-class expertise and actionable insights for your specific needs'

def replacer(match):
    full_block = match.group(0)

    title_match = re.search(r"agentTitle:\s*'([^']+)'", full_block)
    if not title_match:
        return full_block

    full_title = title_match.group(1)
    if '—' in full_title:
        parts = full_title.split('—')
        name = parts[0].strip()
        title = parts[1].strip()
    else:
        name = full_title
        title = full_title

    capability = get_capability(title)

    new_opening = f"openingMessage: (username?: string) => `Hello ${{username || 'Commander'}}! I am {name}, your {title}. I {capability}. What shall we tackle together?`"

    # replace the openingMessage line
    new_block = re.sub(r'openingMessage:\s*\([^)]*\)\s*=>\s*`[^`]+`,', new_opening + ',', full_block)
    return new_block

new_content = re.sub(r"'[^']+': \{.*?^\s*\},?", replacer, content, flags=re.MULTILINE | re.DOTALL)

with open('src/lib/agent-skills/index.ts', 'w') as f:
    f.write(new_content)
