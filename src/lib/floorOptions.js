import { useApi } from '@/hooks/useApi';

// Bookable floors only — used across the wizard, availability page and filters.
export function useBookableFloors() {
  const { data } = useApi('/floors');
  return (data || []).filter((f) => f.bookable);
}
