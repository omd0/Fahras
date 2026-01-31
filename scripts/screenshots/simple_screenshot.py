#!/usr/bin/env python3
"""
Simple screenshot tool for React application pages.
This script assumes the development server is already running.
"""

import os
import time
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException

class SimpleScreenshot:
    def __init__(self):
        self.base_url = "http://localhost:3000"
        self.screenshots_dir = Path("screenshots")
        self.driver = None
        
        # Define all pages to screenshot
        self.pages = [
            {"name": "login", "path": "/login", "public": True},
            {"name": "register", "path": "/register", "public": True},
            {"name": "dashboard", "path": "/dashboard", "public": False},
            {"name": "create_project", "path": "/projects/create", "public": False},
            {"name": "analytics", "path": "/analytics", "public": False},
            {"name": "evaluations", "path": "/evaluations", "public": False},
            {"name": "user_management", "path": "/users", "public": False},
            {"name": "profile", "path": "/profile", "public": False},
            {"name": "settings", "path": "/settings", "public": False},
            {"name": "approvals", "path": "/approvals", "public": False},
        ]
        
        # Create screenshots directory
        self.screenshots_dir.mkdir(exist_ok=True)
    
    def setup_driver(self):
        """Setup Chrome WebDriver with appropriate options"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Run in background
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--disable-plugins")
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.set_window_size(1920, 1080)
            print("SUCCESS: Chrome WebDriver initialized successfully")
            return True
        except Exception as e:
            print(f"ERROR: Failed to initialize Chrome WebDriver: {e}")
            print("Please ensure Chrome and ChromeDriver are installed")
            return False
    
    def test_server_connection(self):
        """Test if the development server is running"""
        try:
            self.driver.get(self.base_url)
            time.sleep(2)
            print("SUCCESS: Development server is accessible")
            return True
        except Exception as e:
            print(f"ERROR: Cannot connect to development server: {e}")
            print("Please ensure the React development server is running on http://localhost:3000")
            return False
    
    def capture_screenshot(self, page_name, page_path):
        """Capture screenshot of a specific page"""
        try:
            url = f"{self.base_url}{page_path}"
            print(f"Capturing {page_name} at {url}")
            
            self.driver.get(url)
            time.sleep(3)  # Wait for page to load
            
            # Take screenshot
            screenshot_path = self.screenshots_dir / f"{page_name}.png"
            self.driver.save_screenshot(str(screenshot_path))
            print(f"SUCCESS: Screenshot saved: {screenshot_path}")
            return True
            
        except Exception as e:
            print(f"ERROR: Failed to capture {page_name}: {e}")
            return False
    
    def run_screenshots(self):
        """Main method to run the screenshot automation"""
        print("Starting screenshot automation...")
        
        # Setup WebDriver
        if not self.setup_driver():
            return False
        
        # Test server connection
        if not self.test_server_connection():
            self.cleanup()
            return False
        
        try:
            # Capture all pages
            print("\nCapturing all pages...")
            for page in self.pages:
                self.capture_screenshot(page["name"], page["path"])
            
            print(f"\nSUCCESS: Screenshot automation completed!")
            print(f"Screenshots saved in: {self.screenshots_dir.absolute()}")
            
        except KeyboardInterrupt:
            print("\nWARNING: Screenshot automation interrupted by user")
        except Exception as e:
            print(f"\nERROR: Error during screenshot automation: {e}")
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Clean up resources"""
        if self.driver:
            self.driver.quit()
            print("SUCCESS: WebDriver closed")

def main():
    """Main entry point"""
    print("Simple React Application Screenshot Tool")
    print("=" * 50)
    print("Note: Make sure the React development server is running on http://localhost:3000")
    print("You can start it with: cd web && npm start")
    print("=" * 50)
    
    # Run the automation
    automation = SimpleScreenshot()
    automation.run_screenshots()

if __name__ == "__main__":
    main()
