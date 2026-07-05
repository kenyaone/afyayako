const { chromium } = require('playwright');
(async () => {
  const axios = (await import('axios')).default;
  const ts = Date.now().toString().slice(-5);
  const username = `DrKipro${ts}`;

  // Create professional user via API
  const signupRes = await axios.post('http://localhost:8000/api/auth/signup/', {
    username, display_name: 'Dr. Kiprotich Sang',
    password: 'Kipro1234!', password_confirm: 'Kipro1234!', role: 'professional',
  });
  const proToken = signupRes.data.access;
  console.log(`0. Created user: ${username} ✓`);

  // Fetch specializations and languages (paginated)
  const specsRes = await axios.get('http://localhost:8000/api/professionals/specializations/?page_size=50');
  const langsRes = await axios.get('http://localhost:8000/api/professionals/languages/?page_size=50');
  const specs = specsRes.data.results || specsRes.data;
  const langs = langsRes.data.results || langsRes.data;

  const depId = specs.find(s => s.name === 'Depression & Mood Disorders')?.id;
  const anxId = specs.find(s => s.name === 'Anxiety & Stress')?.id;
  const engId = langs.find(l => l.name === 'English')?.id;
  const swaId = langs.find(l => l.name === 'Kiswahili')?.id;

  // Submit professional application via API
  await axios.post('http://localhost:8000/api/professionals/register/', {
    kmpdc_license: `KP-2022-${ts}`,
    bio: 'Licensed counseling psychologist with 4 years experience specializing in depression, anxiety, and substance use disorders. I work with individuals using CBT and person-centred approaches in a safe, non-judgmental space.',
    years_experience: 4, gender: 'male', rate_per_hour: 2200,
    mpesa_number: '0722111222',
    specialization_ids: [depId, anxId].filter(Boolean),
    language_ids: [engId, swaId].filter(Boolean),
  }, { headers: { Authorization: `Bearer ${proToken}` } });
  console.log(`0. Application submitted via API ✓`);

  // ── Now browse UI as admin ────────────────────────────────────────────
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[placeholder="StrengthSeeker101"]', 'admin');
  await page.fill('input[type="password"]', 'admin1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');

  // 1. Admin pending tab — Dr. Kiprotich waiting
  await page.goto('http://localhost:5173/admin');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/apply1_pending.png' });
  console.log('1. Admin pending tab ✓');

  // 2. Expand bio
  const chevrons = await page.$$('button.p-1');
  if (chevrons.length > 0) { await chevrons[0].click(); await page.waitForTimeout(600); }
  await page.screenshot({ path: '/tmp/apply2_bio.png' });
  console.log('2. Bio expanded ✓');

  // 3. Approve
  await page.click('text=Approve & Verify');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/apply3_after_approve.png' });
  console.log('3. After approve (removed from pending) ✓');

  // 4. Approved tab
  await page.click('text=Approved');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/apply4_approved_tab.png' });
  console.log('4. Approved tab — Dr. Kiprotich live ✓');

  // 5. Show Apply form (what professional sees)
  await page.goto('http://localhost:5173/apply');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/apply5_apply_form.png' });
  console.log('5. Apply form (what professionals fill in) ✓');


  await browser.close();
  console.log('\n✅ Professional self-apply + admin verify flow complete!');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
