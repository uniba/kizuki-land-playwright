// @ts-check
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }]
  ],

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'], 
        baseURL: 'https://preview.kizuki.land',
        channel: 'chrome',
      },
    },
    // {
    //   name: 'firefox',
    //   use: { 
    //     ...devices['Desktop Firefox'], 
    //     baseURL: 'https://preview.kizuki.land',
    //   },
    // },
    // {
    //   name: 'webkit',
    //   use: { 
    //     ...devices['Desktop Safari'], 
    //     baseURL: 'https://preview.kizuki.land',
    //   },
    // },
  ],

  use: {
    trace: 'on-first-retry',
  },
});
