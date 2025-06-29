import { test, expect, Page } from '@playwright/test';

test('Пользователь может загрузить CSV-файл и увидеть аналитику', async ({ page }: { page: Page }) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', 'src/tests/test-files/test1.csv');
  await expect(page.getByText(/аналитика/i)).toBeVisible();
}); 