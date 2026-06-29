export const Roles = ["CANDIDATE", "ADMIN"] as const;
export const JobTypes = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"] as const;
export const RemoteOptions = ["REMOTE", "HYBRID", "ON_SITE"] as const;
export const JobStatuses = ["ACTIVE", "DRAFT", "CLOSED"] as const;
export const ApplicationStatuses = ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"] as const;

export type Role = (typeof Roles)[number];
export type JobType = (typeof JobTypes)[number];
export type RemoteOption = (typeof RemoteOptions)[number];
export type JobStatus = (typeof JobStatuses)[number];
export type ApplicationStatus = (typeof ApplicationStatuses)[number];
