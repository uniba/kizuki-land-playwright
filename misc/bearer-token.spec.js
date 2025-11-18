// tests/example-authenticated.spec.js
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Path to the token captured by auth.setup.js
const tokenFile = path.join(__dirname, '../playwright/.auth/token.json');

test('Authenticated test using Bearer token', async ({ browser }) => {
  // Ensure token exists
  if (!fs.existsSync(tokenFile)) {
    throw new Error('❌ No token found. Run auth.setup.js first.');
  }

  // Read Bearer token from file
  const { bearerToken } = JSON.parse(fs.readFileSync(tokenFile, 'utf8'));

  // Create a new browser context using the *current project browser*
  const context = await browser.newContext({
    baseURL: test.info().project.use.baseURL, // ✅ Uses baseURL from playwright.config.js
    extraHTTPHeaders: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  const page = await context.newPage();

  // 4️⃣ Go to dashboard (or base URL)
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // 5️⃣ Verify that we’re logged in
  const accountButton = page.locator('button.user__button--account');
  await expect(accountButton).toBeVisible();

  console.log(`✅ Logged in successfully using ${test.info().project.name}`);

  await context.close();
});
