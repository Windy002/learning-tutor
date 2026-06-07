import { defineConfig } from '@playwright/test';
import path from 'node:path';
import os from 'node:os';

const TEST_DATA_DIR = path.join(os.tmpdir(), 'learning-tutor-e2e-test');

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 1,
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  webServer: {
    command: `npx concurrently "vite" "tsx server/index.ts"`,
    port: 5173,
    reuseExistingServer: false,
    timeout: 15000,
    env: {
      LEARNING_TUTOR_DATA_DIR: TEST_DATA_DIR,
      PATH: process.env.PATH,
    },
  },
});
