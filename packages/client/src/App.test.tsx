import { describe, expect, it } from 'vitest';
import App from './App';

describe('React App component', () => {
  it('should render without crashing', () => {
    const component = App();
    expect(component).toBeDefined();
  });
});
