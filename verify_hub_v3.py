from playwright.sync_api import sync_playwright
import glob
import os

def run_cuj(page):
    print("Navigating to hub...")
    page.goto("http://localhost:3000/hub")
    page.wait_for_timeout(2000)

    print("Taking screenshot...")
    page.screenshot(path="/home/jules/verification/screenshots/hub_verification_final_v3.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)

    # clear old videos
    for f in glob.glob("/home/jules/verification/videos/*.webm"):
        os.remove(f)

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
