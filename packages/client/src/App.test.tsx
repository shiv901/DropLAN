import { describe, expect, it } from 'vitest';
import App from './App';

describe('React App component', () => {
  it('should be a valid React function component', () => {
    // Verify App is exported as a function (React component)
    expect(typeof App).toBe('function');
    expect(App.name).toBe('App');
  });
});
