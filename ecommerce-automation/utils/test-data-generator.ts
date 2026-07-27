export interface UserCredentials {
  username: string;
  password: string;
}

export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateCheckoutInfo() {
  return {
    firstName: generateRandomString(6),
    lastName: generateRandomString(8),
    postalCode: String(Math.floor(10000 + Math.random() * 90000)),
  };
}

export function generateInvalidCredentials(): UserCredentials {
  return {
    username: `invalid_${generateRandomString(5)}`,
    password: generateRandomString(12),
  };
}
