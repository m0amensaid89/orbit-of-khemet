from playwright.sync_api import sync_playwright
import os
import shutil

def run_cuj(page):
    # 1. Hub Page
    print("Navigating to /hub...")
    page.goto("http://localhost:3001/hub")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/hub_gilded.png")


    # 2. Pricing Page
    print("Navigating to /pricing...")
    page.goto("http://localhost:3001/pricing")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/pricing_gilded.png")

    # Scroll to stats
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(500)
    page.screenshot(path="/home/jules/verification/screenshots/pricing_stats.png")

    # 3. Forge Page
    print("Navigating to /forge...")
    page.goto("http://localhost:3001/forge")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/forge_gilded.png")

    # 4. Profile Page
    print("Navigating to /profile...")
    page.goto("http://localhost:3001/profile")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/profile_gilded.png")

    # 5. Mobile Nav (Viewport < 768px)
    print("Testing mobile viewport...")
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto("http://localhost:3001/hub")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/mobile_hub.png")

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    os.makedirs("/home/jules/verification/videos", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={"width": 1280, "height": 800}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()