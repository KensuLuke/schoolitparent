/**
 * AppErrorBoundary.tsx — copied from mobile/admin (generic, not
 * staff-specific). Named AppErrorBoundary, not ErrorBoundary, to avoid the
 * expo-router `fromImport` name collision — see the re-export convention
 * in _layout.tsx: `export { ErrorBoundary } from "@/components/AppErrorBoundary";`
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[AppErrorBoundary]", error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message ?? "An unexpected error occurred"}
          </Text>
          <TouchableOpacity style={styles.btn} onPress={this.reset}>
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", color: "#d32f2f", marginBottom: 12 },
  message: { fontSize: 14, color: "#555", textAlign: "center", marginBottom: 24 },
  btn: { backgroundColor: "#007AFF", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 28 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
