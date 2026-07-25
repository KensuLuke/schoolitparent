/**
 * app/(auth)/login.tsx
 *
 * Single login form — no role toggle needed (unlike staff mobile's
 * staff/admin switch), every parent account is the same role.
 */

import { useState, useEffect } from "react";
import {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useMutation } from "urql";
import { toast } from "sonner-native";
import { router } from "expo-router";
import Ionicons from "@react-native-vector-icons/ionicons";
import { SecureStore, AppStore } from "@/storage/storage";
import { useAuthStore, useParentStore } from "@/stores/stores";
import { routes, getHomeRoute } from "@/constants/routes";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { PARENT_LOGIN } from "@/graphql/gql";

export default function LoginScreen() {
  const { primary, background, border, text, mutedText, cardBackground, error: errorColor } =
    useThemeColor();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuthStore();
  const { setProfile } = useParentStore();

  const [{ fetching, error: mutationError }, parentLoginMutation] = useMutation(PARENT_LOGIN);

  useEffect(() => {
    const savedRememberMe = AppStore.getRememberMe();
    setRememberMe(savedRememberMe);
    if (savedRememberMe) {
      const credentials = SecureStore.getCredentials();
      if (credentials) {
        setEmail(credentials.email);
        setPassword(credentials.password);
      }
    }
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter your email and password.");
      return;
    }

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const { data, error } = await parentLoginMutation({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error || !data?.parentLogin) {
      toast.error(
        error?.graphQLErrors?.[0]?.message ||
          error?.networkError?.message ||
          "Invalid credentials. Please check your email and password.",
      );
      return;
    }

    const { token, parent } = data.parentLogin;

    login(
      {
        token,
        parentId: parent.id,
        name: parent.name,
        email: parent.email,
        schoolId: parent.school,
      },
      rememberMe,
      rememberMe ? { email, password } : undefined,
    );
    setProfile(parent);

    router.replace(getHomeRoute());
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.centerWrapper}>
          <ThemedView style={styles.logoContainer}>
            <ThemedView style={[styles.logoCircle, { backgroundColor: primary + "20" }]}>
              <Ionicons name="people-circle" size={52} color={primary} />
            </ThemedView>
            <ThemedText type="title" style={[styles.title, { color: primary }]}>
              SchoolIt
            </ThemedText>
            <ThemedText type="muted">Parent Portal</ThemedText>
          </ThemedView>

          <ThemedView style={[styles.formCard, { backgroundColor: cardBackground }]}>
            <ThemedView style={[styles.inputRow, { borderColor: border, backgroundColor: background }]}>
              <Ionicons name="mail-outline" size={20} color={mutedText} style={styles.inputIcon} />
              <TextInput
                style={[styles.inputField, { color: text }]}
                placeholder="Email Address"
                placeholderTextColor={mutedText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!fetching}
              />
            </ThemedView>

            <ThemedView style={[styles.inputRow, { borderColor: border, backgroundColor: background }]}>
              <Ionicons name="lock-closed-outline" size={20} color={mutedText} style={styles.inputIcon} />
              <TextInput
                style={[styles.inputField, { color: text }]}
                placeholder="Password"
                placeholderTextColor={mutedText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!fetching}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={mutedText}
                />
              </TouchableOpacity>
            </ThemedView>

            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
              disabled={fetching}
            >
              <ThemedView
                style={[
                  styles.checkbox,
                  { borderColor: rememberMe ? primary : border },
                  rememberMe && { backgroundColor: primary },
                ]}
              >
                {rememberMe && <Ionicons name="checkmark" size={14} color="#FFF" />}
              </ThemedView>
              <ThemedText type="small" style={{ color: mutedText }}>
                Remember me
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: primary }, fetching && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={fetching}
            >
              {fetching ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <ThemedView style={styles.loginBtnInner}>
                  <ThemedText style={styles.loginBtnText}>Sign In</ThemedText>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                </ThemedView>
              )}
            </TouchableOpacity>

            {mutationError && (
              <ThemedView style={[styles.errorBox, { backgroundColor: errorColor + "18" }]}>
                <Ionicons name="alert-circle" size={18} color={errorColor} />
                <ThemedText type="small" style={[styles.errorText, { color: errorColor }]}>
                  {mutationError.graphQLErrors?.[0]?.message ||
                    mutationError.message ||
                    "Login failed. Please try again."}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>

          <ThemedView style={[styles.helpCard, { backgroundColor: cardBackground }]}>
            <Ionicons name="help-circle-outline" size={22} color={mutedText} />
            <ThemedText type="muted" style={styles.helpText}>
              Don't have login credentials?{"\n"}Contact your child's school.
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 24 },
  centerWrapper: { width: "100%", maxWidth: 480, alignSelf: "center" },

  logoContainer: { alignItems: "center", marginBottom: 32 },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { marginBottom: 4 },

  formCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 14,
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  inputField: { flex: 1, fontSize: 15 },
  eyeBtn: { padding: 8 },

  rememberRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },

  loginBtn: { height: 52, borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnInner: { flexDirection: "row", alignItems: "center", backgroundColor: "transparent" },
  loginBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },

  errorBox: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 8, gap: 8, marginTop: 4 },
  errorText: { flex: 1 },

  helpCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  helpText: { flex: 1, lineHeight: 20 },
});
