import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import users from '../fixtures/users.json';
import checkoutData from '../fixtures/checkout-data.json';

interface CheckoutTestData {
  firstName: string;
  lastName: string;
  postalCode: string;
  expected: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  firstNameError: 'First Name is required',
  lastNameError: 'Last Name is required',
};

test.describe('Checkout Tests', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    await loginPage.goto('/');
    await loginPage.login(users.standardUser.username, users.standardUser.password);
    await expect(page).toHaveURL(/.*inventory\.html/);

    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/.*checkout-step-one\.html/);
  });

  for (const data of checkoutData as CheckoutTestData[]) {
    test(`checkout with ${data.expected} scenario`, async ({ page }) => {
      await checkoutPage.fillCheckoutInfo(data.firstName, data.lastName, data.postalCode);
      await checkoutPage.continueCheckout();

      if (data.expected === 'success') {
        expect(await checkoutPage.isOnOverviewStep()).toBeTruthy();

        await checkoutPage.finishCheckout();
        expect(await checkoutPage.isCheckoutComplete()).toBeTruthy();

        const completeMessage = await checkoutPage.getCompleteMessage();
        expect(completeMessage).toContain('Thank you for your order');
      } else {
        const errorText = await checkoutPage.getErrorText();
        expect(errorText).toContain(ERROR_MESSAGES[data.expected]);
        expect(await checkoutPage.isOnInfoStep()).toBeTruthy();
      }
    });
  }

  test('cancel checkout returns to cart', async ({ page }) => {
    await checkoutPage.cancelCheckout();
    await expect(page).toHaveURL(/.*cart\.html/);
    expect(await cartPage.isLoaded()).toBeTruthy();
  });

  test('empty postal code shows error', async () => {
    await checkoutPage.fillCheckoutInfo('Faisal', 'Ahmed', '');
    await checkoutPage.continueCheckout();

    const errorText = await checkoutPage.getErrorText();
    expect(errorText).toContain('Postal Code is required');
  });

  test('empty cart after removing item during checkout', async () => {
    await checkoutPage.cancelCheckout();
    await cartPage.removeFirstItem();

    expect(await cartPage.getCartItemCount()).toBe(0);
  });
});
