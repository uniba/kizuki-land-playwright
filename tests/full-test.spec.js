// tests/example-authenticated.spec.js
import { test, expect } from '@playwright/test';

const email = process.env.KIZUKI_EMAIL;
const password = process.env.KIZUKI_PASSWORD;
if (!email || !password) throw new Error('Set KIZUKI_EMAIL and KIZUKI_PASSWORD as env vars');

test('Video Upload and Event Creation', async ({ page }, testInfo) => {
  test.setTimeout(1 * 60 * 1000); // 

  // Login Steps
  await page.goto('https://preview.kizuki.land/sign-in');
  await page.waitForLoadState('networkidle');

  await page.getByPlaceholder('メールアドレス').fill(email);
  await page.getByPlaceholder('6文字以上').fill(password);
  await page.getByRole('button', { name: 'ログイン' }).click();

  // Wait for successful login
  const accountButton = page.locator('button.user__button--account');
  await expect(accountButton).toBeVisible();

  // Navigate to Workshop Hosts
  await page.goto('https://preview.kizuki.land/workshop-hosts');
  await page.waitForLoadState('networkidle');

  await page.getByText('アップロード一覧').click();

  await page.getByRole('link', { name: 'アップロード' }).click();

  await page.waitForURL('https://preview.kizuki.land/workshop-hosts/video-sources/create');
  await expect(page).toHaveURL(/\/workshop-hosts\/video-sources\/create$/);


  // Generate a unique title for the video upload
  const uniqueTitle = `${testInfo.project?.name || 'test'}-${Date.now()}`;

	// Upload Video Steps
  await page.locator('label:has-text("タイトル")').locator('xpath=following::input[1]').fill(uniqueTitle);

  await page.locator('input[type="file"][accept*=".mp4"]').setInputFiles('./tests/resources/test.mp4');

  await page.getByText('送信').click();
  await page.waitForLoadState('networkidle');

	// Redirected to uploads page
  await page.waitForURL('https://preview.kizuki.land/workshop-hosts?tab=videos');

  const videoItem = page.locator('li', {has: page.locator(`p:has-text("${uniqueTitle}")`)});

  await expect(videoItem).toBeVisible();

  console.log(`🎯 Located video item for "${uniqueTitle}"`);

  // Inside this <li>, find the overlay + refresh button
  const overlay = videoItem.locator('text=処理中です。お待ちください。');
  const refreshButton = videoItem.getByText('更新', { exact: true });

	// Wait for video to be processed
	for (let i = 0; i < 10; i++) {
		console.log(`🔍 Check ${i + 1}`);

		const overlayCount = await overlay.count();
		if (overlayCount === 0) {
			console.log('✅ Overlay is gone — done!');
			break;
		}

		console.log('⏳ Still processing...');

		if (await refreshButton.isVisible().catch(() => false)) {
			console.log('🔄 Clicking refresh...');
			await refreshButton.click({ force: true });
		}

		console.log('⏱ Wait 30s...');
		await page.waitForTimeout(30000);
	}

  await expect(videoItem.locator('text=処理中です。お待ちください。')).toHaveCount(0);

  console.log('🎉 SUCCESS — Video uploaded and processed!');

	// Create Event with Uploaded Video

  // Navigate to Workshop Hosts
  await page.goto('https://preview.kizuki.land/workshop-hosts');
  await page.waitForLoadState('networkidle');

  // Create new event steps
  await page.getByRole('link', { name: 'イベントを作成' }).click();

  await page.waitForURL('https://preview.kizuki.land/workshop-hosts/create');
  await expect(page).toHaveURL(/\/workshop-hosts\/create$/);

  await page.getByPlaceholder('イベント名を入力してください').fill('テストタイトル');
  await page.getByPlaceholder('参加人数を決めてください').fill('10');
  await page.locator('input[name="starts-at"][type="datetime-local"]').fill('2025-11-12T14:30');
  await page.locator('input[name="ends-at"][type="datetime-local"]').fill('2040-12-31T00:00');

  await page.getByRole('button', { name: '作成' }).click();

  // Select uploaded video
  await page.locator(`li:has-text("${uniqueTitle}") button:has-text("選択する")`).click();

  const eventUrlLocator = page.getByRole('link', { name: 'https://preview.kizuki.land/' });
  const eventUrl = await eventUrlLocator.innerText();

  await page.getByRole('button', { name: 'アップロード' }).click();

  // Navigate to the created event
  await page.goto(eventUrl);
  await page.waitForLoadState('networkidle');

  await page.getByText('イベント会場へ行く').click();

  await page.getByRole('button', {name: 'おまかせ'}).click();
  await page.getByPlaceholder('ニックネーム（10もじいない）').fill('test');
  await page.getByRole('button', {name: '次へ'}).click();

  await page.getByRole('link', { name: uniqueTitle }).click();

  await page.getByRole('link', { name: '見にいく' }).click();

  await expect(page.locator('.editor__title')).toHaveText(uniqueTitle);

  console.log('🎉 SUCCESS — Event created and verified!');

});
