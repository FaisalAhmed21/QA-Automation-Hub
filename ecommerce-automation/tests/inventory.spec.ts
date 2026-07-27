import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import users from '../fixtures/users.json';
import {
  assertSortedAscending,
  assertSortedDescending,
  assertSortedAlphabetically,
} from '../utils/custom-assertions';

test.describe('Inventory Tests', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);

    await loginPage.goto('/');
    await loginPage.login(users.standardUser.username, users.standardUser.password);
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test('inventory page displays products', async () => {
    const itemCount = await inventoryPage.getItemCount();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('sort by name A to Z', async () => {
    await inventoryPage.selectSort('az');
    const names = await inventoryPage.getProductNames();
    await assertSortedAlphabetically(names, 'asc');
  });

  test('sort by name Z to A', async () => {
    await inventoryPage.selectSort('za');
    const names = await inventoryPage.getProductNames();
    await assertSortedAlphabetically(names, 'desc');
  });

  test('sort by price low to high', async () => {
    await inventoryPage.selectSort('lohi');
    const prices = await inventoryPage.getProductPrices();
    await assertSortedAscending(prices);
  });

  test('sort by price high to low', async () => {
    await inventoryPage.selectSort('hilo');
    const prices = await inventoryPage.getProductPrices();
    await assertSortedDescending(prices);
  });

  test('add to cart updates badge count', async () => {
    expect(await inventoryPage.getCartBadgeCount()).toBeNull();

    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);

    await inventoryPage.addItemToCart('Sauce Labs Bike Light');
    expect(await inventoryPage.getCartBadgeCount()).toBe(2);
  });

  test('add then remove item from inventory', async () => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);

    await inventoryPage.removeItemFromInventory('Sauce Labs Backpack');
    expect(await inventoryPage.getCartBadgeCount()).toBeNull();
  });

  test('cart badge persists across page navigation', async ({ page }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    expect(await inventoryPage.getCartBadgeCount()).toBe(1);

    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);

    await page.goBack();
    await expect(page).toHaveURL(/.*inventory\.html/);

    expect(await inventoryPage.getCartBadgeCount()).toBe(1);
  });
});
