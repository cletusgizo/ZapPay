/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Registration request type for /api/register
 */
export interface RegisterRequest {
  phone: string;
  otp: string;
  password: string;
  walletAddress: string;
}

/**
 * Registration response type for /api/register
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
  token?: string;
}
