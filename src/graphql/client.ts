/**
 * graphql/client.ts
 *
 * urql GraphQL client — copied from mobile/admin/src/graphQL/client.ts
 * verbatim (generic, not staff-specific): lazy client + lazy token read so
 * storage's native module is never touched at module-evaluation time, auth
 * exchange redirects to logout on 401/UNAUTHENTICATED, retry exchange for
 * network blips.
 */

import { createClient, fetchExchange, mapExchange, type Operation } from "urql";
import { authExchange } from "@urql/exchange-auth";
import { retryExchange } from "@urql/exchange-retry";
import { SecureStore } from "@/storage/storage";
import { useAuthStore } from "@/stores/stores";

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER ?? "http://localhost:5001";

function buildClient() {
  return createClient({
    url: `${SERVER_URL}/graphql`,

    fetchOptions: {
      headers: {
        "content-type": "application/json",
      },
    },

    exchanges: [
      mapExchange({
        onError(error) {
          const isAuthError = error.graphQLErrors?.some(
            (e) =>
              e.message.toLowerCase().includes("unauthorized") ||
              e.message.toLowerCase().includes("unauthenticated") ||
              e.message.toLowerCase().includes("authentication required"),
          );

          if (isAuthError) {
            useAuthStore.getState().logout();
          }

          if (__DEV__) {
            console.warn("[GraphQL Error]", error.message);
          }
        },
      }),

      authExchange(async (utils) => {
        return {
          addAuthToOperation(operation: Operation) {
            const token = SecureStore.getToken();
            if (!token) return operation;
            return utils.appendHeaders(operation, {
              Authorization: `Bearer ${token}`,
            });
          },

          didAuthError(error) {
            return error.graphQLErrors.some(
              (e) =>
                e.extensions?.code === "UNAUTHENTICATED" ||
                e.message.toLowerCase().includes("unauthorized"),
            );
          },

          async refreshAuth() {
            const token = SecureStore.getToken();
            if (!token) {
              useAuthStore.getState().logout();
            }
          },
        };
      }),

      retryExchange({
        initialDelayMs: 1000,
        maxDelayMs: 15000,
        maxNumberAttempts: 3,
        randomDelay: true,
        retryIf: (error) => !!error.networkError,
      }),

      fetchExchange,
    ],
  });
}

let _client: ReturnType<typeof buildClient> | null = null;

export function getClient() {
  if (!_client) _client = buildClient();
  return _client;
}
