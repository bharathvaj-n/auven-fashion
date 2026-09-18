const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const FRONTEND_URL = 'http://localhost:5173';
const ADMIN_URL = 'http://localhost:5174';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}

async function captureScreenshots() {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'], defaultViewport: { width: 1280, height: 800 } });
    const page = await browser.newPage();

    console.log('Capturing Frontend...');
    try {
        // Homepage
        await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
        await delay(2000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_Homepage.png'), fullPage: true });

        // Collection / Products
        await page.goto(`${FRONTEND_URL}/collection`, { waitUntil: 'networkidle2' });
        await delay(2000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_Collection.png') });

        // Product Details
        // Try to click first product, if not just skip
        try {
            await page.click('.grid a');
            await delay(2000);
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_ProductDetails.png'), fullPage: true });
        } catch (e) {
            console.log('Could not click product');
        }

        // Customizer (need to find a customizer page or product)
        try {
            await page.goto(`${FRONTEND_URL}/customizer`, { waitUntil: 'networkidle2' });
            await delay(2000);
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_Customizer.png') });
        } catch(e) {}

        // Cart
        await page.goto(`${FRONTEND_URL}/cart`, { waitUntil: 'networkidle2' });
        await delay(2000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_Cart.png') });

        // Login
        await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle2' });
        await delay(2000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_Login.png') });
    } catch(e) {
        console.error('Error capturing frontend:', e);
    }

    console.log('Capturing Admin...');
    try {
        // Admin Login
        await page.goto(ADMIN_URL, { waitUntil: 'networkidle2' });
        await delay(2000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_AdminLogin.png') });
        
        // Let's try to login
        try {
            await page.type('input[type="email"]', 'admin@gmail.com');
            await page.type('input[type="password"]', 'Admin@1234');
            await page.click('button[type="submit"]');
            await delay(3000);
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_AdminDashboard.png'), fullPage: true });

            await page.goto(`${ADMIN_URL}/list`, { waitUntil: 'networkidle2' });
            await delay(2000);
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_AdminProducts.png') });

            await page.goto(`${ADMIN_URL}/orders`, { waitUntil: 'networkidle2' });
            await delay(2000);
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_AdminOrders.png') });
            
        } catch(e) {
            console.log('Admin login failed');
        }

    } catch(e) {
        console.error('Error capturing admin:', e);
    }

    await browser.close();
    console.log('Screenshots captured successfully!');
}

captureScreenshots();
