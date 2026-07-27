import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  private firstNameInput = this.page.locator('[data-test="firstName"]');
  private lastNameInput = this.page.locator('[data-test="lastName"]');
  private postalCodeInput = this.page.locator('[data-test="postalCode"]');
  private continueButton = this.page.locator('[data-test="continue"]');
  private finishButton = this.page.locator('[data-test="finish"]');
  private cancelButton = this.page.locator('[data-test="cancel"]');
  private errorMessage = this.page.locator('[data-test="error"]');
  private completeHeader = this.page.locator('.complete-header');
  private summaryInfo = this.page.locator('.summary_info');

  async fillCheckoutInfo(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async continueCheckout() {
    await this.waitAndClick(this.continueButton);
  }

  async finishCheckout() {
    await this.waitAndClick(this.finishButton);
  }

  async cancelCheckout() {
    await this.waitAndClick(this.cancelButton);
  }

  async getErrorText(): Promise<string | null> {
    const isVisible = await this.errorMessage.isVisible();
    if (!isVisible) return null;
    return this.errorMessage.textContent();
  }

  async isCheckoutComplete(): Promise<boolean> {
    return this.completeHeader.isVisible();
  }

  async getCompleteMessage(): Promise<string | null> {
    return this.completeHeader.textContent();
  }

  async isOnInfoStep(): Promise<boolean> {
    return this.firstNameInput.isVisible();
  }

  async isOnOverviewStep(): Promise<boolean> {
    return this.summaryInfo.isVisible();
  }
}
