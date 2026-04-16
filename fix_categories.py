import re

with open('src/lib/agents.ts', 'r') as f:
    content = f.read()

# Update categories for thoren
content = content.replace(
    '"Categories": {"Marketing": 5, "Writing": 2, "Finance & Capital": 2, "Finance & Operations": 1, "Jobseekers": 1, "Product & Engineering": 1, "Legal & Compliance": 1}',
    '"Categories": {"Marketing": 5, "Writing": 2, "Finance & Capital": 2, "Finance & Operations": 1, "Jobseekers": 1, "Product & Engineering": 1, "Legal & Compliance": 1, "Strategy & Data": 3}'
)
# We need to use regex because format might differ
