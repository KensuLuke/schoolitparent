/**
 * useChildren.ts
 *
 * Wraps MY_CHILDREN — every screen that needs the parent's linked children
 * (verified or not) goes through this instead of re-issuing the query.
 */

import { useQuery } from "urql";
import { MY_CHILDREN } from "@/graphql/gql";
import type { ParentStudentLink } from "@/storage/storage";

export default function useChildren() {
  const [{ data, fetching, error }, refetch] = useQuery({ query: MY_CHILDREN });

  const children: ParentStudentLink[] = data?.myChildren ?? [];
  const verifiedChildren = children.filter((c) => c.status === "VERIFIED");

  return {
    children,
    verifiedChildren,
    fetching,
    error,
    refetch: () => refetch({ requestPolicy: "network-only" }),
  };
}
