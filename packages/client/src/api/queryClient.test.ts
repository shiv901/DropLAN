import { describe, it, expect, beforeEach } from 'vitest';
import { queryClient } from './queryClient';

describe('React Query Setup', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('should create a QueryClient with proper defaults', () => {
    expect(queryClient).toBeDefined();
    expect(queryClient.getDefaultOptions()).toBeDefined();
  });

  it('should have proper cache times configured', () => {
    const options = queryClient.getDefaultOptions();
    expect(options.queries?.staleTime).toBe(1000 * 60 * 5); // 5 minutes
    expect(options.queries?.gcTime).toBe(1000 * 60 * 10); // 10 minutes
  });
});
