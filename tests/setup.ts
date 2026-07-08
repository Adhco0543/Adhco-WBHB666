/**
 * Test Setup File
 * Runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
process.env.TEST_AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || 'test-token';

// Mock console methods to reduce noise during tests
global.console.error = jest.fn();
global.console.warn = jest.fn();

// Set longer timeout for API tests
jest.setTimeout(30000);

export {};
