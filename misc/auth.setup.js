import { test as setup } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Go to login page and perform login
  await page.goto('https://preview.kizuki.land/sign-in');
  await page.waitForLoadState('networkidle');

  await page.getByPlaceholder('メールアドレス').fill('kizukiland-test@azukaritai.com');
  await page.getByPlaceholder('6文字以上').fill('4vHNtzLCLJningTe4VqX');
  await page.getByRole('button', { name: 'ログイン' }).click();

  // Wait for successful login
  await page.waitForSelector('button.user__button--account', { state: 'visible' });

  // Save storage state for future tests
  await page.context().storageState({ path: authFile, indexedDB: true });
  
});
