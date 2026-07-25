/**
 * app/(parent)/child/[studentId].tsx
 *
 * One child's detail — attendance summary, recent grades, and every
 * weekly/mid-term report, each tappable to the acknowledge screen. All
 * four queries here go through requireVerifiedLink() server-side
 * (parentResolvers.js) — if this parent's link to this student ever stops
 * being VERIFIED, every one of these queries starts failing, not just some.
 */

import { useLocalSearchParams, router } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { useQuery } from "urql";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ClickableCard } from "@/components/ClickableCard";
import Card from "@/components/Card";
import { Badge } from "@/components/Badge";
import { useThemeColor } from "@/hooks/useThemeColor";
import { CHILD_ATTENDANCE, CHILD_GRADES, CHILD_WEEKLY_REPORTS, CHILD_MID_TERM_REPORTS } from "@/graphql/gql";
import { reportDetail } from "@/constants/routes";
import type { AttendanceRecord, GradeRecord, WeeklyReportRecord, MidTermReportRecord } from "@/storage/storage";

export default function ChildDetailScreen() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const { background, mutedText, cardBackground } = useThemeColor();

  const [{ data: attData, fetching: attFetching }] = useQuery({
    query: CHILD_ATTENDANCE,
    variables: { studentId },
    pause: !studentId,
  });
  const [{ data: gradeData, fetching: gradeFetching }] = useQuery({
    query: CHILD_GRADES,
    variables: { studentId },
    pause: !studentId,
  });
  const [{ data: weeklyData, fetching: weeklyFetching }] = useQuery({
    query: CHILD_WEEKLY_REPORTS,
    variables: { studentId },
    pause: !studentId,
  });
  const [{ data: midTermData, fetching: midTermFetching }] = useQuery({
    query: CHILD_MID_TERM_REPORTS,
    variables: { studentId },
    pause: !studentId,
  });

  const attendance: AttendanceRecord[] = attData?.childAttendance ?? [];
  const grades: GradeRecord[] = gradeData?.childGrades ?? [];
  const weeklyReports: WeeklyReportRecord[] = weeklyData?.childWeeklyReports ?? [];
  const midTermReports: MidTermReportRecord[] = midTermData?.childMidTermReports ?? [];

  const present = attendance.filter((a) => a.status === "PRESENT").length;
  const absent = attendance.filter((a) => a.status === "ABSENT").length;
  const late = attendance.filter((a) => a.status === "LATE").length;

  return (
    <ScrollView style={[styles.container, { backgroundColor: background }]} contentContainerStyle={styles.content}>
      {/* Attendance summary */}
      <ThemedText type="subtitleSemiBold" style={styles.sectionTitle}>
        Attendance
      </ThemedText>
      <Card style={styles.attendanceCard}>
        {attFetching ? (
          <ThemedText type="muted">Loading…</ThemedText>
        ) : (
          <ThemedView style={styles.attendanceRow}>
            <ThemedView style={styles.attendanceStat}>
              <ThemedText type="title" style={{ fontSize: 22 }}>{present}</ThemedText>
              <ThemedText type="small" style={{ color: mutedText }}>Present</ThemedText>
            </ThemedView>
            <ThemedView style={styles.attendanceStat}>
              <ThemedText type="title" style={{ fontSize: 22 }}>{late}</ThemedText>
              <ThemedText type="small" style={{ color: mutedText }}>Late</ThemedText>
            </ThemedView>
            <ThemedView style={styles.attendanceStat}>
              <ThemedText type="title" style={{ fontSize: 22 }}>{absent}</ThemedText>
              <ThemedText type="small" style={{ color: mutedText }}>Absent</ThemedText>
            </ThemedView>
          </ThemedView>
        )}
      </Card>

      {/* Recent grades */}
      <ThemedText type="subtitleSemiBold" style={styles.sectionTitle}>
        Recent Grades
      </ThemedText>
      {gradeFetching ? (
        <ThemedText type="muted" style={styles.mutedPad}>Loading…</ThemedText>
      ) : grades.length === 0 ? (
        <ThemedText type="muted" style={styles.mutedPad}>No grades yet.</ThemedText>
      ) : (
        grades.slice(0, 10).map((g) => (
          <Card key={g.id} style={styles.rowCard}>
            <ThemedView style={styles.cardRowBetween}>
              <ThemedText type="defaultSemiBold">{g.subject?.name ?? "Subject"}</ThemedText>
              <ThemedText type="defaultSemiBold">{g.percentage != null ? `${g.percentage}%` : "—"}</ThemedText>
            </ThemedView>
          </Card>
        ))
      )}

      {/* Weekly reports */}
      <ThemedText type="subtitleSemiBold" style={styles.sectionTitle}>
        Weekly Reports
      </ThemedText>
      {weeklyFetching ? (
        <ThemedText type="muted" style={styles.mutedPad}>Loading…</ThemedText>
      ) : weeklyReports.length === 0 ? (
        <ThemedText type="muted" style={styles.mutedPad}>No weekly reports yet.</ThemedText>
      ) : (
        weeklyReports.map((r) => (
          <ClickableCard
            key={r.id}
            style={[styles.rowCard, { backgroundColor: cardBackground }]}
            onPress={() => router.push(reportDetail(r.id, "WEEKLY"))}
          >
            <ThemedView style={styles.cardRowBetween}>
              <ThemedText type="defaultSemiBold">
                Week of {new Date(r.weekStart).toLocaleDateString()}
              </ThemedText>
              <Badge value={r.status} />
            </ThemedView>
          </ClickableCard>
        ))
      )}

      {/* Mid-term reports */}
      <ThemedText type="subtitleSemiBold" style={styles.sectionTitle}>
        Mid-Term Reports
      </ThemedText>
      {midTermFetching ? (
        <ThemedText type="muted" style={styles.mutedPad}>Loading…</ThemedText>
      ) : midTermReports.length === 0 ? (
        <ThemedText type="muted" style={styles.mutedPad}>No mid-term reports yet.</ThemedText>
      ) : (
        midTermReports.map((r) => (
          <ClickableCard
            key={r.id}
            style={[styles.rowCard, { backgroundColor: cardBackground }]}
            onPress={() => router.push(reportDetail(r.id, "MID_TERM"))}
          >
            <ThemedView style={styles.cardRowBetween}>
              <ThemedText type="defaultSemiBold">
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Mid-term report"}
              </ThemedText>
              <Badge value={r.status} />
            </ThemedView>
          </ClickableCard>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 8, paddingBottom: 40 },
  sectionTitle: { marginTop: 16, marginBottom: 8 },
  attendanceCard: {},
  attendanceRow: { flexDirection: "row", justifyContent: "space-around" },
  attendanceStat: { alignItems: "center", gap: 2 },
  rowCard: { marginBottom: 8 },
  cardRowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  mutedPad: { paddingVertical: 8 },
});
