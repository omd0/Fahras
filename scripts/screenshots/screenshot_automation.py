#!/usr/bin/env python3
"""
Automated screenshot tool for React application pages.
This script will start the development server, navigate to all pages,
and capture screenshots using Selenium WebDriver.
"""

import os
import time
import subprocess
import signal
import sys
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException

class ScreenshotAutomation:
    def __init__(self):
        self.base_url = "http://localhost:3000"
        self.screenshots_dir = Path("screenshots")
        self.driver = None
        self.server_process = None
        
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
        chrome_options.add_argument("--disable-images")  # Faster loading
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.set_window_size(1920, 1080)
            print("SUCCESS: Chrome WebDriver initialized successfully")
            return True
        except Exception as e:
            print(f"ERROR: Failed to initialize Chrome WebDriver: {e}")
            print("Please ensure Chrome and ChromeDriver are installed")
            return False
    
    def start_dev_server(self):
        """Start the React development server"""
        print("Starting React development server...")
        try:
            # Change to web directory and start the server
            os.chdir("web")
            self.server_process = subprocess.Popen(
                ["npm", "start"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=None if os.name == 'nt' else os.setsid
            )
            
            # Wait for server to start
            print("Waiting for server to start...")
            time.sleep(10)  # Give server time to start
            
            # Test if server is running
            import requests
            for i in range(30):  # Wait up to 30 seconds
                try:
                    response = requests.get(self.base_url, timeout=5)
                    if response.status_code == 200:
                        print("SUCCESS: Development server is running")
                        os.chdir("..")  # Go back to root directory
                        return True
                except:
                    time.sleep(1)
            
            print("ERROR: Failed to start development server")
            return False
            
        except Exception as e:
            print(f"ERROR: Error starting development server: {e}")
            return False
    
    def stop_dev_server(self):
        """Stop the development server"""
        if self.server_process:
            try:
                if os.name == 'nt':  # Windows
                    self.server_process.terminate()
                else:  # Unix/Linux
                    os.killpg(os.getpgid(self.server_process.pid), signal.SIGTERM)
                self.server_process.wait(timeout=10)
                print("SUCCESS: Development server stopped")
            except Exception as e:
                print(f"WARNING: Error stopping server: {e}")
    
    def login_user(self):
        """Login as a test user to access protected routes"""
        try:
            # Navigate to login page
            self.driver.get(f"{self.base_url}/login")
            time.sleep(3)
            
            # Fill login form (assuming default test credentials)
            email_field = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.NAME, "email"))
            )
            password_field = self.driver.find_element(By.NAME, "password")
            
            # Use test credentials (you may need to adjust these)
            email_field.send_keys("admin@example.com")
            password_field.send_keys("password")
            
            # Submit login form
            login_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            login_button.click()
            
            # Wait for redirect to dashboard
            WebDriverWait(self.driver, 10).until(
                EC.url_contains("/dashboard")
            )
            print("SUCCESS: Successfully logged in")
            return True
            
        except Exception as e:
            print(f"WARNING: Could not login (this is expected for public pages): {e}")
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
        
        # Start development server
        if not self.start_dev_server():
            self.cleanup()
            return False
        
        try:
            # Capture public pages first
            print("\nCapturing public pages...")
            for page in self.pages:
                if page["public"]:
                    self.capture_screenshot(page["name"], page["path"])
            
            # Try to login for protected pages
            print("\nAttempting to login for protected pages...")
            login_success = self.login_user()
            
            # Capture protected pages
            print("\nCapturing protected pages...")
            for page in self.pages:
                if not page["public"]:
                    if login_success:
                        self.capture_screenshot(page["name"], page["path"])
                    else:
                        print(f"WARNING: Skipping {page['name']} - login required")
            
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
        
        self.stop_dev_server()

def main():
    """Main entry point"""
    print("React Application Screenshot Automation")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("web/package.json"):
        print("ERROR: Please run this script from the project root directory")
        print("   Expected to find: web/package.json")
        sys.exit(1)
    
    # Check if npm is available
    try:
        result = subprocess.run(["npm", "--version"], check=True, capture_output=True, text=True)
        print(f"Found npm version: {result.stdout.strip()}")
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"ERROR: npm is not installed or not in PATH: {e}")
        sys.exit(1)
    
    # Run the automation
    automation = ScreenshotAutomation()
    automation.run_screenshots()

if __name__ == "__main__":
    main()