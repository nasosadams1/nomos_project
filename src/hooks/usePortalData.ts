import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  collectPortalLawyerIds,
  createEmptyPortalState,
  isMissingClaimClientRecordsError,
  mapLawyersById,
  type LawyerMiniProfile,
} from '../lib/portal';
import { supabase } from '../lib/supabase';

export function usePortalData(session: Session | null) {
  const accessToken = session?.access_token ?? null;
  const [portalData, setPortalData] = useState(createEmptyPortalState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !supabase) {
      setPortalData(createEmptyPortalState());
      setLoading(false);
      setError(null);
      setSyncNotice(null);
      return;
    }

    const client = supabase;
    let isMounted = true;

    async function loadPortalData() {
      setLoading(true);
      setError(null);
      setSyncNotice(null);

      let nextSyncNotice: string | null = null;

      try {
        const { error: claimError } = await client.rpc('claim_client_records');

        if (claimError && !isMissingClaimClientRecordsError(claimError)) {
          console.error('Error claiming portal records:', claimError);
          nextSyncNotice =
            'We signed you in, but could not automatically attach older requests to this account yet.';
        }

        const [
          { data: consultations, error: consultationsError },
          { data: cases, error: casesError },
          { data: messages, error: messagesError },
        ] = await Promise.all([
          client.from('consultations').select('*').order('scheduled_at', { ascending: true }),
          client.from('cases').select('*').order('updated_at', { ascending: false }),
          client.from('messages').select('*').order('created_at', { ascending: false }),
        ]);

        if (consultationsError) {
          throw consultationsError;
        }

        if (casesError) {
          throw casesError;
        }

        if (messagesError) {
          throw messagesError;
        }

        const lawyerIds = collectPortalLawyerIds(consultations ?? [], cases ?? []);
        let lawyersById: Record<string, LawyerMiniProfile> = {};

        if (lawyerIds.length > 0) {
          const { data: lawyers, error: lawyersError } = await client
            .from('lawyers')
            .select('id, full_name, city')
            .in('id', lawyerIds);

          if (lawyersError) {
            throw lawyersError;
          }

          lawyersById = mapLawyersById((lawyers ?? []) as LawyerMiniProfile[]);
        }

        if (isMounted) {
          setPortalData({
            consultations: consultations ?? [],
            cases: cases ?? [],
            messages: messages ?? [],
            lawyersById,
          });
          setSyncNotice(nextSyncNotice);
        }
      } catch (nextError) {
        console.error('Error loading portal data:', nextError);

        if (isMounted) {
          setError(
            'We could not load your portal data. Please make sure you are signed in with the same email tied to your requests.',
          );
          setSyncNotice(nextSyncNotice);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadPortalData();

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  return {
    portalData,
    loading,
    error,
    syncNotice,
  };
}
