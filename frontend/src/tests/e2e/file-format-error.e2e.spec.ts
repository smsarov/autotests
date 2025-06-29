import { test, expect, Page } from '@playwright/test';

test('Ошибка при загрузке невалидного файла (не csv)', async ({ page }: { page: Page }) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', 'src/tests/test-files/bad.txt');
  await expect(page.getByText(/только \*\.csv файлы/i)).toBeVisible();
});

test('Невалидный файл не появляется в истории', async ({ page }: { page: Page }) => {
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', 'src/tests/test-files/bad.txt');
  await expect(page.getByText(/только \*\.csv файлы/i)).toBeVisible();
  await page.goto('/history');
  await expect(await page.locator('text=bad.txt').count()).toBe(0);
}); 