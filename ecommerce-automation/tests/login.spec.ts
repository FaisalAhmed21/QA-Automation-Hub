import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import users from '../fixtures/users.json';

test.describe('Login Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto('/');
  });

  test('valid login lands on inventory page', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await loginPage.login(users.standardUser.username, users.standardUser.password);

    await expect(page).toHaveURL(/.*inventory\.html/);
    expect(await inventoryPage.isLoaded()).toBeTruthy();
  });

  test('locked-out user shows lockout error', async () => {
    await loginPage.login(users.lockedOutUser.username, users.lockedOutUser.password);

    const errorText = await loginPage.getErrorText();
    expect(errorText).toContain('Sorry, this user has been locked out');
  });

  test('empty username shows required error', async () => {
    await loginPage.login('', users.standardUser.password);

    const errorText = await loginPage.getErrorText();
    expect(errorText).toContain('Username is required');
  });

  test('empty password shows required error', async () => {
    await loginPage.login(users.standardUser.username, '');

    const errorText = await loginPage.getErrorText();
    expect(errorText).toContain('Password is required');
  });

  test('wrong password shows generic auth error', async () => {
    await loginPage.login(users.standardUser.username, 'wrong_password');

    const errorText = await loginPage.getErrorText();
    expect(errorText).toContain('Username and password do not match');
  });
});
