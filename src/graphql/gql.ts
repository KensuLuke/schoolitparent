/**
 * graphql/gql.ts
 *
 * All queries/mutations the parent app uses — matches
 * server/graphQl/typeDefs/parentTypedefs.js and parentResolvers.js exactly.
 * Field selections are intentionally scoped to what each screen actually
 * renders (v1), not the full type — expand as screens need more.
 */

import { gql } from "urql";

export const PARENT_LOGIN = gql`
  mutation ParentLogin($email: String!, $password: String!) {
    parentLogin(email: $email, password: $password) {
      token
      role
      expiresIn
      parent {
        id
        name
        email
        phone
        school
      }
    }
  }
`;

export const MY_CHILDREN = gql`
  query MyChildren {
    myChildren {
      id
      parent
      school
      relationship
      status
      verifiedAt
      rejectionReason
      createdAt
      student {
        id
        firstName
        lastName
        studentId
        image
        class {
          id
          name
        }
      }
    }
  }
`;

export const REQUEST_PARENT_STUDENT_LINK = gql`
  mutation RequestParentStudentLink(
    $studentId: ID!
    $relationship: ParentStudentLink_Relationship_Enum
  ) {
    requestParentStudentLink(studentId: $studentId, relationship: $relationship) {
      id
      status
      relationship
      createdAt
    }
  }
`;

export const CHILD_ATTENDANCE = gql`
  query ChildAttendance($studentId: ID!, $termId: ID) {
    childAttendance(studentId: $studentId, termId: $termId) {
      id
      date
      status
      reason
    }
  }
`;

export const CHILD_GRADES = gql`
  query ChildGrades($studentId: ID!, $termId: ID) {
    childGrades(studentId: $studentId, termId: $termId) {
      id
      percentage
      subject {
        id
        name
      }
      term {
        id
        name
      }
      createdAt
    }
  }
`;

export const CHILD_ANNOUNCEMENTS = gql`
  query ChildAnnouncements($studentId: ID!) {
    childAnnouncements(studentId: $studentId) {
      id
      title
      message
      createdAt
    }
  }
`;

export const CHILD_WEEKLY_REPORTS = gql`
  query ChildWeeklyReports($studentId: ID!, $termId: ID) {
    childWeeklyReports(studentId: $studentId, termId: $termId) {
      id
      weekStart
      weekEnd
      status
      overallPerformance
      teacherComments
      parentComments
      parentRating
      acknowledgedAt
    }
  }
`;

export const CHILD_MID_TERM_REPORTS = gql`
  query ChildMidTermReports($studentId: ID!, $termId: ID) {
    childMidTermReports(studentId: $studentId, termId: $termId) {
      id
      status
      teacherComments
      parentComments
      parentRating
      acknowledgedAt
      createdAt
    }
  }
`;

export const CHILD_TERMINAL_REPORT = gql`
  query ChildTerminalReport($studentId: ID!, $termId: ID!) {
    childTerminalReport(studentId: $studentId, termId: $termId) {
      id
      status
      remarks {
        academicSummary
        behavioralNote
      }
      parentFeedback
      parentRating
      acknowledgedAt
    }
  }
`;

export const ACKNOWLEDGE_REPORT = gql`
  mutation AcknowledgeReport(
    $reportId: ID!
    $reportType: ReportType!
    $feedbackText: String
    $rating: Int
  ) {
    acknowledgeReport(
      reportId: $reportId
      reportType: $reportType
      feedbackText: $feedbackText
      rating: $rating
    ) {
      id
      reportType
      status
      acknowledgedAt
      parentRating
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS — see server/graphQl/queries/notificationResolvers.js (list/
// unread-count/mark-read) and server/graphQl/mutations/notificationMutation.js
// (Expo push token register/unregister). Recipient scoping happens
// server-side from the auth token — this app never passes a recipientId.
// ─────────────────────────────────────────────────────────────────────────────

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($input: NotificationQueryInput!) {
    notifications(input: $input) {
      items {
        id
        title
        message
        type
        channel
        isRead
        entity
        createdAt
      }
      total
      page
      limit
      hasMore
      cursor
    }
  }
`;

export const GET_UNREAD_NOTIFICATION_COUNT = gql`
  query GetUnreadNotificationCount {
    unreadNotificationCount
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      isRead
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// PUSH — Expo push token registration (see notificationMutation.js).
// ─────────────────────────────────────────────────────────────────────────────

export const REGISTER_EXPO_PUSH_TOKEN = gql`
  mutation RegisterExpoPushToken($token: String!) {
    registerExpoPushToken(token: $token) {
      success
      message
    }
  }
`;

export const UNREGISTER_EXPO_PUSH_TOKEN = gql`
  mutation UnregisterExpoPushToken($token: String!) {
    unregisterExpoPushToken(token: $token) {
      success
      message
    }
  }
`;

// Delivered over the graphql-ws WS connection set up in graphql/client.ts.
// $recipientId is sent for schema compat only — the server IGNORES it and
// derives the channel from the authenticated connection itself (see
// graphQl/queries/schemeOfWorkNotifications.js's notificationCreated
// resolver), so there's no client-controllable way to see anyone else's
// notifications.
export const NOTIFICATION_CREATED = gql`
  subscription OnNotificationCreated {
    notificationCreated(recipientId: "self") {
      id
      title
      message
      type
      channel
      isRead
      entity
      createdAt
    }
  }
`;
