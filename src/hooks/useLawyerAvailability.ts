import { useEffect, useState } from 'react';
import { fetchLawyerAvailability } from '../lib/api';
import type { LawyerAvailability } from '../lib/availability';
import { supabase } from '../lib/supabase';

export function useLawyerAvailability(lawyerIds: string[], days = 10) {
  const lawyerIdKey = JSON.stringify(lawyerIds.filter(Boolean));
  const [availabilityByLawyer, setAvailabilityByLawyer] = useState<Record<string, LawyerAvailability>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parsedLawyerIds = JSON.parse(lawyerIdKey) as string[];

    if (!supabase || parsedLawyerIds.length === 0) {
      setAvailabilityByLawyer({});
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;

    async function loadAvailability() {
      setLoading(true);
      setError(null);

      try {
        const nextAvailability = await fetchLawyerAvailability(parsedLawyerIds, days);

        if (isMounted) {
          setAvailabilityByLawyer(nextAvailability);
        }
      } catch (nextError) {
        console.error('Error loading lawyer availability:', nextError);

        if (isMounted) {
          setAvailabilityByLawyer({});
          setError('We could not verify live request-window availability right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadAvailability();

    return () => {
      isMounted = false;
    };
  }, [days, lawyerIdKey]);

  return {
    availabilityByLawyer,
    loading,
    error,
  };
}
