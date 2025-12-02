# Playwright test for Kizuki Land 

### Test flow
1. Upload a video
2. Create an event and select uploaded video from Step 1

# How to run locally

### Dependencies
1. Playwright
2. dotenv

### Instructions
1. Create a '.env' file and set these environment variables:
    1. KIZUKI_EMAIL=xxx
    2. KIZUKI_PASSWORD=xxx


2. Run `npx playwright test`

# GitHub Actions

Scheduled to run at 01:00 A.M JST

### Jobs
1. test (runs PlayWright script)
2. deploy (uploads test report to Vercel)
3. notify (sends test result notifaction in Slack)



