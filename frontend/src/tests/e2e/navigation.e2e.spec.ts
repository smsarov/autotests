import { test, expect, Page } from '@playwright/test';

test('Навигация по вкладкам: Главная → Генератор → История → Главная', async ({ page }: { page: Page }) => {
  await page.goto('/');
  await page.click('a:has-text("CSV Генератор")');
  await expect(page.getByTestId('generate-page')).toBeVisible();
  await page.click('a:has-text("История")');
  await expect(page.getByTestId('history-page')).toBeVisible();
  await page.click('a:has-text("CSV Аналитик")');
  await expect(page.getByText(/загрузите csv файл/i)).toBeVisible();
});

test('Переход на генерацию из истории по кнопке "Сгенерировать больше"', async ({ page }: { page: Page }) => {
  await page.goto('/history');
  await page.click('button:has-text("Сгенерировать больше")');
  await expect(page.getByTestId('generate-page')).toBeVisible();
}); 