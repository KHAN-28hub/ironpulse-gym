const puppeteer = require("puppeteer-core");
const path = require("path");

const ARTIFACT_DIR = "/Users/mirmohammedalikhan/.gemini/antigravity/brain/5b391025-d81d-4953-bb3d-ed41225d007a";

async function runQA() {
  console.log("Starting Phase 1 automated browser QA...");
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,900"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // 1. Visit Landing Page
  console.log("Navigating to http://127.0.0.1:3000...");
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "phase1_01_landing.png") });
  console.log("Saved phase1_01_landing.png");

  // 2. Click "I'm the Gym Owner"
  console.log("Clicking 'I\\'m the Gym Owner' card...");
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("h2"));
    const ownerHeader = cards.find(h => h.innerText.includes("Gym Owner") || h.innerText.includes("मालिक"));
    if (ownerHeader) ownerHeader.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "phase1_02_owner_login_card.png") });
  console.log("Saved phase1_02_owner_login_card.png");

  // 3. Submit Owner Login
  console.log("Submitting Owner Login...");
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: "networkidle0" });
  console.log("Current URL:", page.url());
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "phase1_03_owner_dashboard.png") });
  console.log("Saved phase1_03_owner_dashboard.png");

  // 4. Logout
  console.log("Logging out of Owner...");
  await page.click('button[title="Sign Out"]');
  await page.waitForNavigation({ waitUntil: "networkidle0" });

  // 5. Click "I'm a Member"
  console.log("Clicking 'I\\'m a Member' card...");
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("h2"));
    const memberHeader = cards.find(h => h.innerText.includes("Member") || h.innerText.includes("सदस्य"));
    if (memberHeader) memberHeader.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "phase1_04_member_login_card.png") });
  console.log("Saved phase1_04_member_login_card.png");

  // 6. Submit Member Login
  console.log("Submitting Member Login...");
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: "networkidle0" });
  console.log("Current URL:", page.url());
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "phase1_05_member_dashboard.png") });
  console.log("Saved phase1_05_member_dashboard.png");

  // 7. Logout
  console.log("Logging out of Member...");
  await page.click('button[title="Sign Out"]');
  await page.waitForNavigation({ waitUntil: "networkidle0" });

  // 8. Click Trainer 1-Click Demo
  console.log("Clicking 1-Click Trainer Demo Login...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const trainerBtn = btns.find(b => b.innerText.includes("Trainer"));
    if (trainerBtn) trainerBtn.click();
  });
  await page.waitForNavigation({ waitUntil: "networkidle0" });
  console.log("Current URL:", page.url());
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "phase1_06_trainer_dashboard.png") });
  console.log("Saved phase1_06_trainer_dashboard.png");

  await browser.close();
  console.log("Phase 1 automated browser QA completed successfully!");
}

runQA().catch((err) => {
  console.error("QA error:", err);
  process.exit(1);
});
