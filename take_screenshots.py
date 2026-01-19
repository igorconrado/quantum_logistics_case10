#!/usr/bin/env python
"""
Screenshot automation script for Quantum Logistics
Captures screenshots of different states of the application
"""
import asyncio
from playwright.async_api import async_playwright
import os

BASE_URL = "http://localhost:5000"
SNAPSHOTS_DIR = "snapshots"

async def take_screenshots():
    os.makedirs(SNAPSHOTS_DIR, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1920, "height": 1080})

        print("1. Taking screenshot of initial state...")
        await page.goto(BASE_URL)
        await page.wait_for_timeout(2000)
        await page.screenshot(path=f"{SNAPSHOTS_DIR}/01_initial_state.png", full_page=False)
        print("   Saved: 01_initial_state.png")

        print("2. Taking screenshot of Inter-City mode with points loaded...")
        # Select inter-city mode (default)
        await page.select_option("#route-type", "inter-city")
        await page.wait_for_timeout(500)
        await page.select_option("#depot-capital", "1")  # Sao Paulo
        await page.select_option("#num-additional-points", "4")
        await page.click("#load-brazil-capitals")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=f"{SNAPSHOTS_DIR}/02_intercity_points_loaded.png", full_page=False)
        print("   Saved: 02_intercity_points_loaded.png")

        print("3. Taking screenshot of Classical route calculation...")
        await page.select_option("#algorithm-inter", "classical")
        await page.click("#calculate-route")
        await page.wait_for_timeout(3000)
        await page.screenshot(path=f"{SNAPSHOTS_DIR}/03_intercity_classical_route.png", full_page=False)
        print("   Saved: 03_intercity_classical_route.png")

        print("4. Taking screenshot with Real Roads enabled...")
        real_roads_checkbox = page.locator("#use-real-roads")
        if await real_roads_checkbox.count() > 0:
            await real_roads_checkbox.check()
            await page.click("#calculate-route")
            await page.wait_for_timeout(5000)
            await page.screenshot(path=f"{SNAPSHOTS_DIR}/04_intercity_real_roads.png", full_page=False)
            print("   Saved: 04_intercity_real_roads.png")
        else:
            print("   Skipped: Real roads checkbox not found")

        print("5. Taking screenshot of Intra-City mode...")
        await page.select_option("#route-type", "intra-city")
        await page.wait_for_timeout(500)
        await page.select_option("#city-selection", "sao_paulo")
        await page.select_option("#num-delivery-points", "5")
        await page.click("#generate-intra-city-route")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=f"{SNAPSHOTS_DIR}/05_intracity_points_loaded.png", full_page=False)
        print("   Saved: 05_intracity_points_loaded.png")

        print("6. Taking screenshot of Quantum route calculation...")
        await page.select_option("#algorithm", "quantum")
        await page.select_option("#num-delivery-points", "3")  # Quantum limited to 4 points
        await page.click("#generate-intra-city-route")
        await page.wait_for_timeout(2000)
        real_roads_checkbox = page.locator("#use-real-roads")
        if await real_roads_checkbox.count() > 0:
            await real_roads_checkbox.uncheck()
        await page.click("#calculate-route")
        await page.wait_for_timeout(5000)
        await page.screenshot(path=f"{SNAPSHOTS_DIR}/06_quantum_route.png", full_page=False)
        print("   Saved: 06_quantum_route.png")

        await browser.close()

    print("\n" + "=" * 50)
    print("All screenshots saved to:", os.path.abspath(SNAPSHOTS_DIR))
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(take_screenshots())
