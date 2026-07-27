import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private usernameInput = this.page.locator('#user-name');
  private passwordInput = this.page.locator('#password');
  private loginButton = this.page.locator('#login-button');
  private errorMessage = this.page.locator('[data-test="error"]');

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.waitAndClick(this.loginButton);
  }

  async getErrorText() {
    return this.errorMessage.textContent();
  }

  async isErrorVisible(): Promise<boolean> {
    return this.errorMessage.isVisible();
  }
}
