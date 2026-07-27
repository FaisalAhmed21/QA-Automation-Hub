import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  private cartItems = this.page.locator('.cart_item');
  private itemNames = this.page.locator('.inventory_item_name');
  private removeButtons = this.page.locator('button[id^="remove"]');
  private checkoutButton = this.page.locator('[data-test="checkout"]');
  private continueShoppingButton = this.page.locator('[data-test="continue-shopping"]');

  async isLoaded(): Promise<boolean> {
    return this.page.locator('.cart_list').isVisible();
  }

  async getCartItemNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async getCartItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async removeItem(itemName: string) {
    const removeButton = this.page.locator(
      `.cart_item:has(.inventory_item_name:text-is("${itemName}")) button`
    );
    await this.waitAndClick(removeButton);
  }

  async removeFirstItem() {
    await this.waitAndClick(this.removeButtons.first());
  }

  async proceedToCheckout() {
    await this.waitAndClick(this.checkoutButton);
  }

  async continueShopping() {
    await this.waitAndClick(this.continueShoppingButton);
  }
}
