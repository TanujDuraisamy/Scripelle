import "dotenv/config";
export function requiredSecret(name: string): string {
  const value = process.env[name];
  if (!value || value.length < 32 || /change.?me|your.*secret/i.test(value)) {
    throw new Error(`${name} must contain at least 32 characters of independently generated secret material`);
  }
  return value;
}
export const jwtSecret = requiredSecret("JWT_SECRET");
export const refreshSecret = requiredSecret("JWT_REFRESH_SECRET");
export const sessionSecret = requiredSecret("SESSION_SECRET");
if (new Set([jwtSecret, refreshSecret, sessionSecret]).size !== 3) {
  throw new Error("JWT and session secrets must be distinct");
}
