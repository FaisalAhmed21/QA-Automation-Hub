import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  private inventoryContainer = this.page.locator('[data-test="inventory-container"]');
  private sortDropdown = this.page.locator('[data-test="product-sort-container"]');
  private inventoryItems = this.page.locator('.inventory_item');
  private itemNames = this.page.locator('.inventory_item_name');
  private itemPrices = this.page.locator('.inventory_item_price');
  private cartBadge = this.page.locator('.shopping_cart_badge');
  private cartLink = this.page.locator('.shopping_cart_link');

  async isLoaded(): Promise<boolean> {
    return this.inventoryContainer.isVisible();
  }

  async selectSort(option: string) {
    await this.sortDropdown.selectOption(option);
  }

  async getProductNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  async getProductPrices(): Promise<number[]> {
    const priceTexts = await this.itemPrices.allTextContents();
    return priceTexts.map((price) => parseFloat(price.replace('$', '')));
  }

  async addItemToCart(itemName: string) {
    const addButton = this.page.locator(
      `.inventory_item:has(.inventory_item_name:text-is("${itemName}")) button`
    );
    await this.waitAndClick(addButton);
  }

  async removeItemFromInventory(itemName: string) {
    const removeButton = this.page.locator(
      `.inventory_item:has(.inventory_item_name:text-is("${itemName}")) button`
    );
    await this.waitAndClick(removeButton);
  }

  async getCartBadgeCount(): Promise<number | null> {
    const isVisible = await this.cartBadge.isVisible();
    if (!isVisible) return null;
    const text = await this.cartBadge.textContent();
    return text ? parseInt(text, 10) : null;
  }

  async goToCart() {
    await this.waitAndClick(this.cartLink);
  }

  async getItemCount(): Promise<number> {
    return this.inventoryItems.count();
  }
}
