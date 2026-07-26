/**
 * app/(parent)/social/[postId].tsx
 *
 * Pushed on top of the tabs, matching the same Stack-push pattern already
 * used for child/[studentId] and report/[reportId] in (parent)/_layout.tsx.
 */
import { useLocalSearchParams } from "expo-router";
import { SocialPostDetail } from "@/components/social/SocialPostDetail";

export default function SocialPostScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  return <SocialPostDetail postId={postId} />;
}
