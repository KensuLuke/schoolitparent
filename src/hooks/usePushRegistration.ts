import { useEffect, useRef } from "react";
import { useMutation } from "urql";
import {
  REGISTER_EXPO_PUSH_TOKEN,
  UNREGISTER_EXPO_PUSH_TOKEN,
} from "@/graphql/gql";
import { useAuthStore } from "@/stores/stores";
import { getExpoPushToken } from "@/utils/pushToken";

/**
 * Registers/unregisters this device's Expo push token against the logged-in
 * parent's account. Mount once, near the app root (see app/_layout.tsx).
 */
export function usePushRegistration() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [, registerToken] = useMutation(REGISTER_EXPO_PUSH_TOKEN);
  const [, unregisterToken] = useMutation(UNREGISTER_EXPO_PUSH_TOKEN);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (tokenRef.current) {
        unregisterToken({ token: tokenRef.current });
        tokenRef.current = null;
      }
      return;
    }

    let cancelled = false;
    getExpoPushToken().then((token) => {
      if (cancelled || !token) return;
      tokenRef.current = token;
      registerToken({ token });
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, registerToken, unregisterToken]);
}
