/**
 * useImagingDeepLink — fetches a short-lived HMAC handoff token from the
 * `imaging-handoff-token` edge function and opens the imaging app
 * (maps.sankyo.in) in a new tab on the requested target route.
 *
 * - Authenticated users get a signed handoff URL → seamless cross-app SSO.
 * - Unauthenticated users (or any failure) gracefully fall back to a plain
 *   public link to the same destination — they'll be asked to sign in on
 *   the imaging side and the original `?next=` will still resolve.
 */
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  buildImagingHandoffUrl,
  buildImagingPublicUrl,
  type ImagingTarget,
} from '@/lib/imaging/handoff';

interface OpenOptions {
  /** Force unsigned link (skip the edge function call). Defaults to false. */
  unsigned?: boolean;
}

export function useImagingDeepLink() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLaunching, setIsLaunching] = useState(false);

  const openImaging = useCallback(
    async (target: ImagingTarget, opts: OpenOptions = {}) => {
      // Anonymous or explicitly-unsigned: just open the public URL.
      if (opts.unsigned || !user) {
        const url = buildImagingPublicUrl(target);
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }

      setIsLaunching(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          'imaging-handoff-token',
          { body: { target } },
        );
        if (error || !data?.handoff) {
          throw new Error(error?.message || 'handoff_unavailable');
        }
        const url = buildImagingHandoffUrl(target, data.handoff);
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (e) {
        // Soft fallback — never block the user; just open the public link
        // and let them sign in on the imaging side.
        console.warn('[imaging handoff] falling back to public URL', e);
        const url = buildImagingPublicUrl(target);
        window.open(url, '_blank', 'noopener,noreferrer');
        toast({
          title: 'Opened without single sign-on',
          description:
            "We couldn't sign you in automatically — please sign in again on the imaging app.",
        });
      } finally {
        setIsLaunching(false);
      }
    },
    [user, toast],
  );

  return { openImaging, isLaunching, isAuthenticated: !!user };
}
