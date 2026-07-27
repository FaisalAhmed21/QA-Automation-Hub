import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import users from '../fixtures/users.json';

test.describe('Cart Tests', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);

    await loginPage.goto('/');
    await loginPage.login(users.standardUser.username, users.standardUser.password);
    await expect(page).toHaveURL(/.*inventory\.html/);
  });

  test('empty cart shows no items', async ({ page }) => {
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);

    expect(await cartPage.getCartItemCount()).toBe(0);
  });

  test('add items and verify cart contents', async ({ page }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.addItemToCart('Sauce Labs Bike Light');

    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart\.html/);

    const itemNames = await cartPage.getCartItemNames();
    expect(itemNames).toContain('Sauce Labs Backpack');
    expect(itemNames).toContain('Sauce Labs Bike Light');
    expect(await cartPage.getCartItemCount()).toBe(2);
  });

  test('remove item from cart', async ({ page }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.addItemToCart('Sauce Labs Bike Light');

    await inventoryPage.goToCart();
    await cartPage.removeItem('Sauce Labs Backpack');

    const itemNames = await cartPage.getCartItemNames();
    expect(itemNames).not.toContain('Sauce Labs Backpack');
    expect(itemNames).toContain('Sauce Labs Bike Light');
    expect(await cartPage.getCartItemCount()).toBe(1);
  });

  test('continue shopping returns to inventory', async ({ page }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();

    await cartPage.continueShopping();
    await expect(page).toHaveURL(/.*inventory\.html/);
    expect(await inventoryPage.isLoaded()).toBeTruthy();
  });

  test('cart persists after logout and re-login', async ({ page }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    expect(await cartPage.getCartItemCount()).toBe(1);

    await page.locator('#react-burger-menu-btn').click();
    const logoutLink = page.locator('#logout_sidebar_link');
    await logoutLink.waitFor({ state: 'visible' });
    await logoutLink.click();
    await expect(page).toHaveURL('/');

    await loginPage.login(users.standardUser.username, users.standardUser.password);
    await expect(page).toHaveURL(/.*inventory\.html/);

    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('proceed to checkout navigates to checkout page', async ({ page }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();

    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);
  });
});
