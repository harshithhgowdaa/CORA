export const ROLES = ['admin', 'manager', 'officer', 'student_assistant', 'read_only'] as const
export type Role = (typeof ROLES)[number]

export const COMPANY_STATUSES = ['Prospect', 'Contacted', 'Meeting Scheduled', 'Discussion', 'Proposal', 'Negotiation', 'Partnership Signed', 'Active Partner', 'Dormant', 'Closed'] as const
export type CompanyStatus = (typeof COMPANY_STATUSES)[number]
export const INTERACTION_TYPES = ['Meeting', 'Phone Call', 'Email', 'Campus Visit', 'Guest Lecture', 'Workshop', 'Partnership Discussion', 'Internship Discussion', 'Placement Discussion', 'Other'] as const
export type InteractionType = (typeof INTERACTION_TYPES)[number]
export const FOLLOW_UP_STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled', 'Overdue'] as const
export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number]
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const
export type Priority = (typeof PRIORITIES)[number]
export const OPPORTUNITY_STAGES = ['Prospect', 'Qualified', 'Meeting', 'Proposal Sent', 'Negotiation', 'Approved', 'Active', 'Completed', 'Lost'] as const
export type OpportunityStage = (typeof OPPORTUNITY_STAGES)[number]
export const OPPORTUNITY_TYPES = ['Internship Program', 'Placement Hiring', 'Guest Lecture', 'Workshop', 'Industry Project', 'Research Collaboration', 'Sponsorship', 'MoU', 'Hackathon', 'Training Program', 'Other'] as const
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number]

export type Permission = 'read' | 'write' | 'assign' | 'manage_users' | 'export' | 'view_analytics' | 'audit'

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: ['read', 'write', 'assign', 'manage_users', 'export', 'view_analytics', 'audit'],
  manager: ['read', 'write', 'assign', 'export', 'view_analytics', 'audit'],
  officer: ['read', 'write', 'export'],
  student_assistant: ['read', 'write'],
  read_only: ['read'],
}

export const RVU_DOMAIN = '@rvu.edu.in'
export const CORA_ADMIN_EMAIL = 'harshithgowdakbtech24@rvu.edu.in'

export interface CurrentUser { id: string; orgId: string; email: string; fullName: string; role: Role }
export interface ActionSuccess<T> { success: true; data: T }
export interface ActionFailure { success: false; error: string; code?: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT' | 'DATABASE' }
export type ActionResponse<T> = ActionSuccess<T> | ActionFailure

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}
