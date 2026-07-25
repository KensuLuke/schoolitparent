import { useSubscription } from "urql";
import { NOTIFICATION_CREATED } from "@/graphql/gql";
import { useAuthStore } from "@/stores/stores";

/**
 * Live delivery over the graphql-ws connection set up in graphql/client.ts.
 * The server resolves the recipient channel from the authenticated
 * connection itself, never from client input (see graphQl/queries/
 * schemeOfWorkNotifications.js's notificationCreated resolver), so this can
 * never receive anyone else's notifications.
 *
 * `onNotification` fires once per pushed row — callers decide what to do
 * with it; this hook holds no state itself.
 */
export function useNotificationsSubscription(onNotification: () => void) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useSubscription(
    { query: NOTIFICATION_CREATED, pause: !isAuthenticated },
    (_prev, data) => {
      onNotification();
      return data;
    },
  );
}
