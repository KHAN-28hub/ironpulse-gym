const puppeteer = require("puppeteer-core");
const path = require("path");

const ARTIFACT_DIR = "/Users/mirmohammedalikhan/.gemini/antigravity/brain/5b391025-d81d-4953-bb3d-ed41225d007a";

async function runCompleteQA() {
  console.log("Starting IronPulse complete platform browser QA...");
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,960"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 960 });

  // 1. Landing Page
  console.log("1. Visiting Landing Page...");
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "ironpulse_01_landing.png") });

  // 2. Owner Login
  console.log("2. Logging in as Gym Owner...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const ownerBtn = btns.find(b => b.innerText.includes("Owner"));
    if (ownerBtn) ownerBtn.click();
  });
  await page.waitForNavigation({ waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "ironpulse_02_owner_overview.png") });
  console.log("Captured Owner Overview.");

  // 3. Owner Member Management Tab
  console.log("3. Navigating to Owner Member Management...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const memTab = btns.find(b => b.innerText.includes("Member Management"));
    if (memTab) memTab.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "ironpulse_03_owner_members.png") });
  console.log("Captured Owner Members.");

  // 4. Owner Plans & Pricing Tab
  console.log("4. Navigating to Plans & Pricing...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const tab = btns.find(b => b.innerText.includes("Plans & Pricing"));
    if (tab) tab.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "ironpulse_04_owner_plans.png") });
  console.log("Captured Owner Plans.");

  // 5. Owner Billing & Invoices Tab
  console.log("5. Navigating to Billing & Invoices...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const tab = btns.find(b => b.innerText.includes("Billing & Invoices"));
    if (tab) tab.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "ironpulse_05_owner_billing.png") });
  console.log("Captured Owner Billing.");

  // 6. Owner Attendance Hub & Scanner
  console.log("6. Opening QR Attendance Scanner...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find(b => b.innerText.includes("QR Check-in Scanner") || b.innerText.includes("Turnstile Scanner"));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "ironpulse_06_owner_qr_scanner.png") });
  console.log("Captured QR Scanner Modal.");

  // Close scanner
  await page.evaluate(() => {
    const closeBtns = Array.from(document.querySelectorAll("button"));
    const closeBtn = closeBtns.find(b => b.innerHTML.includes("svg") && b.className.includes("absolute"));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // 7. Owner Equipment & Locker Grid
  console.log("7. Navigating to Equipment & Locker Grid...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const tab = btns.find(b => b.innerText.includes("Equipment & Lockers"));
    if (tab) tab.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "ironpulse_07_owner_lockers.png") });
  console.log("Captured Owner Lockers & Equipment.");

  // 8. Owner Logout
  console.log("8. Logging out of Owner...");
  await page.click('button[title="Sign Out"]');
  await page.waitForNavigation({ waitUntil: "networkidle0" });

  // 9. Member Login
  console.log("9. Logging in as Member Alex Rivera...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const memBtn = btns.find(b => b.innerText.includes("Member") && !b.innerText.includes("Owner"));
    if (memBtn) memBtn.click();
  });
  await page.waitForNavigation({ waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "ironpulse_08_member_home.png") });
  console.log("Captured Member Home & Holographic Card.");

  // 10. Member Workout & Rest Timer Tab
  console.log("10. Navigating to Member Workout & Rest Timer...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const tab = btns.find(b => b.innerText.includes("Workout & Timer") || b.innerText.includes("Workout"));
    if (tab) tab.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "ironpulse_09_member_workouts.png") });
  console.log("Captured Member Workouts.");

  // 11. Member Nutrition Tab
  console.log("11. Navigating to Diet & Macros...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const tab = btns.find(b => b.innerText.includes("Diet & Macros") || b.innerText.includes("Diet"));
    if (tab) tab.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "ironpulse_10_member_nutrition.png") });
  console.log("Captured Member Nutrition.");

  // 12. Member Body Progress Tab
  console.log("12. Navigating to Body Progress...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const tab = btns.find(b => b.innerText.includes("Body Progress"));
    if (tab) tab.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "ironpulse_11_member_progress.png") });
  console.log("Captured Member Body Progress.");

  // 13. Member Classes Tab
  console.log("13. Navigating to Class Booking...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const tab = btns.find(b => b.innerText.includes("Book Classes") || b.innerText.includes("Classes"));
    if (tab) tab.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "ironpulse_12_member_classes.png") });
  console.log("Captured Member Classes.");

  // 14. Member PulseAI Coach Assistant Tab
  console.log("14. Navigating to PulseAI Assistant...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const tab = btns.find(b => b.innerText.includes("PulseAI Assistant") || b.innerText.includes("AI Coach"));
    if (tab) tab.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "ironpulse_13_member_ai_coach.png") });
  console.log("Captured Member PulseAI Coach.");

  // 15. Member Logout
  console.log("15. Logging out of Member...");
  await page.click('button[title="Sign Out"]');
  await page.waitForNavigation({ waitUntil: "networkidle0" });

  // 16. Trainer Login
  console.log("16. Logging in as Trainer Coach Sarah Connor...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const trBtn = btns.find(b => b.innerText.includes("Trainer"));
    if (trBtn) trBtn.click();
  });
  await page.waitForNavigation({ waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "ironpulse_14_trainer_dashboard.png") });
  console.log("Captured Trainer Dashboard.");

  await browser.close();
  console.log("IronPulse complete platform browser QA executed successfully with all captures!");
}

runCompleteQA().catch((err) => {
  console.error("QA Error:", err);
  process.exit(1);
});
