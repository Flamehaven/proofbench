#!/usr/bin/env python3
"""
ProofBench Screenshot Capture Script

Automatically captures screenshots for README documentation.
Requires: playwright, pillow

Install:
    pip install playwright pillow
    playwright install chromium
"""

import asyncio
import sys
from pathlib import Path
from playwright.async_api import async_playwright


async def capture_screenshots():
    """Capture screenshots of ProofBench UI"""

    # Configuration
    BASE_URL = "http://localhost:5173"  # Vite default port
    OUTPUT_DIR = Path(__file__).parent.parent / "screenshots"
    OUTPUT_DIR.mkdir(exist_ok=True)

    screenshots = [
        {
            "name": "main_dashboard",
            "url": "/",
            "title": "Main Dashboard",
            "description": "Hybrid Dashboard with proof list and LII metrics",
            "viewport": {"width": 1920, "height": 1080},
            "wait_for": ".dashboard-container",  # Adjust selector
        },
        {
            "name": "step_analysis",
            "url": "/",  # Navigate to proof detail
            "title": "Step-by-Step Analysis",
            "description": "Detailed verification results with symbolic + semantic breakdown",
            "viewport": {"width": 1920, "height": 1200},
            "wait_for": ".step-results-panel",  # Adjust selector
        },
        {
            "name": "justification_graph",
            "url": "/",
            "title": "Justification Graph",
            "description": "Visual dependency analysis with cycle detection",
            "viewport": {"width": 1920, "height": 1080},
            "wait_for": ".justification-graph",  # Adjust selector
        },
    ]

    print("[*] Starting screenshot capture...")
    print(f"[*] Base URL: {BASE_URL}")
    print(f"[*] Output directory: {OUTPUT_DIR}")
    print()

    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=2,  # Retina display
        )
        page = await context.new_page()

        # Check if server is running
        try:
            await page.goto(BASE_URL, timeout=5000)
        except Exception as e:
            print(f"[-] Error: Cannot connect to {BASE_URL}")
            print(f"[-] Make sure development server is running: npm run dev")
            print(f"[-] Error details: {e}")
            await browser.close()
            return False

        print("[+] Connected to development server")
        print()

        # Capture each screenshot
        for i, shot in enumerate(screenshots, 1):
            print(f"[{i}/{len(screenshots)}] Capturing: {shot['title']}")

            try:
                # Set viewport
                await page.set_viewport_size(shot["viewport"])

                # Navigate to URL
                await page.goto(f"{BASE_URL}{shot['url']}")

                # Wait for content
                try:
                    await page.wait_for_selector(shot["wait_for"], timeout=10000)
                except Exception:
                    print(f"    [!] Warning: Selector '{shot['wait_for']}' not found, capturing anyway")

                # Additional wait for animations
                await asyncio.sleep(1)

                # Capture screenshot
                output_path = OUTPUT_DIR / f"{shot['name']}.png"
                await page.screenshot(path=str(output_path), full_page=False)

                print(f"    [+] Saved: {output_path}")
                print(f"    [+] Description: {shot['description']}")
                print()

            except Exception as e:
                print(f"    [-] Error capturing {shot['name']}: {e}")
                print()

        await browser.close()

    print("[+] Screenshot capture complete!")
    print(f"[+] Files saved to: {OUTPUT_DIR}")
    print()
    print("Next steps:")
    print("1. Review screenshots in the 'screenshots/' directory")
    print("2. Update README.md with actual screenshot links")
    print("3. Commit and push screenshots to GitHub")

    return True


async def main():
    """Main entry point"""
    try:
        success = await capture_screenshots()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n[!] Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"[-] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
