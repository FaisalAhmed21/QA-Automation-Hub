import { Locator, expect } from '@playwright/test';

export async function assertSortedAscending(values: number[]): Promise<void> {
  const sorted = [...values].sort((a, b) => a - b);
  expect(values).toEqual(sorted);
}

export async function assertSortedDescending(values: number[]): Promise<void> {
  const sorted = [...values].sort((a, b) => b - a);
  expect(values).toEqual(sorted);
}

export async function assertSortedAlphabetically(
  values: string[],
  direction: 'asc' | 'desc' = 'asc'
): Promise<void> {
  const sorted = [...values].sort((a, b) =>
    direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
  );
  expect(values).toEqual(sorted);
}

export async function assertErrorContains(
  errorLocator: Locator,
  expectedText: string
): Promise<void> {
  await expect(errorLocator).toBeVisible();
  await expect(errorLocator).toContainText(expectedText);
}

export async function assertUrlContains(page: import('@playwright/test').Page, urlPart: string): Promise<void> {
  await expect(page).toHaveURL(new RegExp(urlPart));
}
