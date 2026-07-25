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
