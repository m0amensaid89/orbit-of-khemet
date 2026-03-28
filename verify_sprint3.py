import asyncio
from playwright.async_api import async_playwright
import time
import os

async def verify():
    print("Starting verification for Sprint 3: Custom Agent Forge...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        # Step 1: Set fake commander plan
        await page.goto("http://localhost:3002")
        await page.evaluate('localStorage.setItem("orbit_plan", "commander")')
        await page.evaluate('localStorage.setItem("theme", "dark")')

        # Step 2: Go to Forge
        await page.goto("http://localhost:3002/forge")
        await page.wait_for_selector("text=AGENT FORGE")

        # Capture form
        os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
        await page.screenshot(path="/home/jules/verification/screenshots/1_forge_form.png")
        print("Captured Forge form")

        # Fill out form
        await page.fill('input[placeholder="e.g. Khepris"]', "Test Agent")
        await page.fill('input[placeholder="e.g. Brand Voice Architect"]', "Test Role")
        await page.fill('input[placeholder="What does this agent do in one sentence?"]', "Test Description")
        await page.fill('textarea[placeholder*="You are [Agent Name]"]', "Test System Prompt")

        await page.click("text=FORGE AGENT ✦")
        print("Submitted form")

        # Wait for redirect
        await page.wait_for_selector("text=TEST AGENT")
        await page.wait_for_selector("text=✦ CUSTOM")
        await page.screenshot(path="/home/jules/verification/screenshots/2_custom_agent_roster.png")
        print("Captured Custom Agent in Roster")

        # Go to Chat
        await page.click("text=Launch")
        await page.wait_for_selector("text=Test Agent")
        await page.wait_for_selector("text=CUSTOM")
        await page.screenshot(path="/home/jules/verification/screenshots/3_chat_custom_agent.png")
        print("Captured Chat with Custom Agent")

        # Go to Profile
        await page.goto("http://localhost:3002/profile")
        await page.wait_for_selector("text=MY FORGE")
        await page.wait_for_selector("text=TEST AGENT")
        await page.screenshot(path="/home/jules/verification/screenshots/4_profile_my_forge.png")
        print("Captured Profile MY FORGE section")

        await browser.close()
        print("Verification complete.")

asyncio.run(verify())
