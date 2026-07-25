/**
 * utils/pushToken.ts
 *
 * Expo push token acquisition — standard Expo flow (permission request +
 * getExpoPushTokenAsync). See server/notification/expoPush.js for the
 * sending side and server/graphQl/mutations/notificationMutation.js for
 * registerExpoPushToken/unregisterExpoPushToken. Same implementation as the
 * student/staff apps' utils/pushToken.ts.
 *
 * NOTE: this app's app.json has no extra.eas.projectId yet (no EAS project
 * set up) — getExpoPushToken() returns null until one is added, so push
 * silently no-ops rather than failing; the in-app notification inbox works
 * regardless.
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Returns null (never throws) when running on a simulator/emulator, when
 * permission is denied, when no EAS project id is configured, or when
 * acquisition otherwise fails — every caller treats "no token" as a normal,
 * silent no-op. */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    if (!Device.isDevice) return null;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return null;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    if (!projectId) return null;

    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data;
  } catch (error) {
    console.warn("[pushToken] failed to acquire Expo push token:", error);
    return null;
  }
}
