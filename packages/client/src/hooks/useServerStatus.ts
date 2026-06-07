import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAppStore } from '../stores';

/**
 * Hook to fetch and manage server status
 */
export function useServerStatus() {
  const { setServerPort, setServerStatus } = useAppStore();

  const query = useQuery({
    queryKey: ['server', 'status'],
    queryFn: async () => {
      setServerStatus('connecting');
      try {
        const data = await apiClient.getServerStatus();
        setServerPort(data.port);
        setServerStatus('connected');
        return data;
      } catch {
        setServerStatus('disconnected');
        throw new Error('Failed to connect to server');
      }
    },
    refetchInterval: 5000, // Poll every 5 seconds
    retry: 3,
  });

  return query;
}
