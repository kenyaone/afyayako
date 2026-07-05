const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  // Login as admin
  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[placeholder="StrengthSeeker101"]', 'admin');
  await page.fill('input[type="password"]', 'admin1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');

  // 1. Revenue dashboard
  await page.goto('http://localhost:5173/admin/revenue');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/rev1_admin_revenue.png', fullPage: true });
  console.log('1. Revenue dashboard ✓');

  // 2. Pricing page
  await page.goto('http://localhost:5173/pricing');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/rev2_pricing.png', fullPage: true });
  console.log('2. Pricing page ✓');

  // 3. Subscribe page (navigate with plan state)
  await page.goto('http://localhost:5173/pricing');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  // Click upgrade on Premium plan
  await page.click('button:has-text("Upgrade to Premium")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/rev3_subscribe.png' });
  console.log('3. Subscribe page ✓');

  // 4. Corporate EAP page
  await page.goto('http://localhost:5173/corporate');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/rev4_corporate.png', fullPage: true });
  console.log('4. Corporate EAP page ✓');

  // 5. Fill corporate form
  await page.fill('input[placeholder="Acme Kenya Ltd"]', 'Safaricom PLC');
  await page.fill('input[placeholder="50"]', '150');
  await page.waitForTimeout(800);
  await page.fill('input[placeholder="Jane Wanjiku"]', 'Mary Wanjiku');
  await page.fill('input[placeholder="hr@company.co.ke"]', 'hr@safaricom.co.ke');
  await page.fill('input[placeholder="Banking, Tech, Healthcare..."]', 'Telecommunications');
  const phoneInputs = await page.$$('input[placeholder="0712345678"]');
  if (phoneInputs[0]) await phoneInputs[0].fill('0722000100');
  if (phoneInputs[1]) await phoneInputs[1].fill('0722000100');
  await page.screenshot({ path: '/tmp/rev5_corporate_filled.png', fullPage: true });
  console.log('5. Corporate form filled ✓');

  await browser.close();
  console.log('\n✅ All revenue pages working!');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
