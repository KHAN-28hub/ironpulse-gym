const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function runUnitTests() {
  console.log("=== RUNNING IRONPULSE TEST SUITE ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Auth & Token Tests
  console.log("\n[1] AUTH & JWT SUITE");
  const secret = "ironpulse_super_secret_jwt_key_2026";
  const payload = { userId: "user-123", email: "test@ironpulse.fit", role: "OWNER", name: "Marcus Vance" };
  const token = jwt.sign(payload, secret, { expiresIn: "1h" });
  assert(typeof token === "string" && token.length > 20, "JWT token successfully signed");

  const decoded = jwt.verify(token, secret);
  assert(decoded.userId === "user-123" && decoded.role === "OWNER", "JWT token successfully verified with claims");

  const passwordHash = await bcrypt.hash("ironpulse123", 10);
  const isValid = await bcrypt.compare("ironpulse123", passwordHash);
  const isInvalid = await bcrypt.compare("wrongpass", passwordHash);
  assert(isValid === true, "Valid password successfully authenticated");
  assert(isInvalid === false, "Incorrect password properly rejected");

  // 2. Billing & Tax Calculation Tests
  console.log("\n[2] BILLING & TAX SUITE");
  const basePrice = 129.0;
  const taxRate = 0.18;
  const discount = 20.0;
  const calculatedTax = Number((basePrice * taxRate).toFixed(2));
  const netTotal = Number((basePrice + calculatedTax - discount).toFixed(2));

  assert(calculatedTax === 23.22, "18% GST accurately calculated ($23.22)");
  assert(netTotal === 132.22, "Net invoice total after coupon deduction matches ($132.22)");

  // 3. Attendance Turnstile Validation Tests
  console.log("\n[3] ATTENDANCE & GATE RULES SUITE");
  function validateEntry(membershipStatus) {
    if (membershipStatus === "ACTIVE") return { access: true, code: 200 };
    if (membershipStatus === "EXPIRED") return { access: false, code: 403, reason: "Expired" };
    if (membershipStatus === "FROZEN") return { access: false, code: 403, reason: "Frozen" };
    return { access: false, code: 401 };
  }

  assert(validateEntry("ACTIVE").access === true, "Active membership granted gate access");
  assert(validateEntry("EXPIRED").access === false && validateEntry("EXPIRED").reason === "Expired", "Expired membership denied turnstile entry");
  assert(validateEntry("FROZEN").access === false && validateEntry("FROZEN").reason === "Frozen", "Frozen membership prevented from checking in");

  console.log(`\nTEST RESULTS: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) process.exit(1);
}

runUnitTests();
