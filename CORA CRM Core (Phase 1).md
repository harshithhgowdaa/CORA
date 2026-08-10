# CORA CRM Core (Phase 1)
## Product Requirements Document (PRD)

**Product:** CORA CRM Core  
**Version:** 1.1 (Updated with Relationship Ownership & Officer Collaboration)  
**Document Type:** Enterprise Product Requirements Document (PRD)  
**Prepared For:** Corporate & Alumni Relations Department  
**Prepared By:** Product & Engineering Team  
**Status:** Phase 1 Build Specification  

---

# 1. Executive Summary

CORA CRM Core is the first production-ready release of the Corporate & Alumni Relationship Operating System.

Phase 1 focuses on solving the department's highest-frequency operational problems:

- Corporate relationship tracking
- Officer ownership visibility
- Interaction history
- Follow-up management
- Partnership pipeline visibility
- Leadership reporting

The platform acts as a centralized CRM where every company relationship is assigned to a responsible officer, every interaction is recorded, every follow-up is tracked, and leadership can see real-time ownership and workload across the team.

Unlike generic CRMs, CORA is designed for university corporate engagement workflows where multiple officers often work with the same company across different initiatives such as internships, research collaborations, guest lectures, sponsorships, and industry projects.

---

# 2. Problem Statement

## Current State

Corporate relationship information is distributed across:

- Excel spreadsheets
- Google Sheets
- Individual email inboxes
- Personal notes
- Shared folders
- WhatsApp conversations

Additionally, multiple officers interact with the same company independently, leading to:

- Duplicate outreach
- Conflicting communication
- Missed follow-ups
- Unclear ownership
- Loss of institutional knowledge when staff change
- Difficulty understanding who is managing which company

## Desired State

For every company, the department should immediately know:

- Who is the primary relationship owner?
- Which officer is handling internships?
- Which officer is handling research collaborations?
- What was the last interaction?
- What follow-up is pending?
- What opportunities are active?
- What is the overall relationship status?

---

# 3. Product Vision

Create a centralized Corporate Relationship Intelligence Platform that enables multiple officers to collaboratively manage company relationships while preserving complete institutional history and providing leadership with real-time operational visibility.

---

# 4. Product Goals

## Primary Goals

- Centralize corporate relationship data
- Establish clear relationship ownership
- Prevent duplicate outreach
- Capture complete interaction history
- Automate follow-up management
- Track partnership opportunities
- Provide executive dashboards

## Success Metrics

| KPI | Current | Target |
|-----|---------|--------|
| Time to identify company owner | Unknown | <15 sec |
| Time to find company information | 10–20 min | <30 sec |
| Missed follow-ups | High | -80% |
| Monthly reporting effort | 6 hrs | <30 min |
| Companies with assigned owner | Inconsistent | 100% |
| Companies with documented next action | <30% | >90% |
| Duplicate corporate outreach | Frequent | Near zero |

---

# 5. Users

## Primary Users

### Corporate Relations Officer

Responsibilities:

- Manage assigned companies
- Record meetings
- Track opportunities
- Create follow-ups
- Collaborate with other officers

### Corporate Relations Manager

Responsibilities:

- Assign company ownership
- Monitor officer workload
- Review pipeline
- Track overdue actions
- Generate executive reports

### Student Assistant

Responsibilities:

- Data entry
- Contact management
- Interaction logging
- Event and meeting support

### Department Leadership

Responsibilities:

- View dashboards
- Monitor corporate engagement
- Review ownership distribution
- Export reports

---

# 6. Scope

## Included in Phase 1

- Authentication
- Corporate CRM
- Relationship ownership
- Officer collaboration
- Corporate contact management
- Interaction timeline
- Follow-up automation
- Opportunity pipeline
- Executive analytics dashboard
- Search
- Import/export
- Role-based access

## Excluded from Phase 1

- Alumni CRM
- Events
- Mentorship
- Email synchronization
- Calendar synchronization
- Mobile application
- AI features
- Relationship scoring

---

# 7. Core Product Concept

## Relationship Ownership Model

Every company can have:

### Primary Relationship Owner

One officer who is ultimately accountable for the relationship.

Responsibilities:

- Overall relationship strategy
- External communication consistency
- Coordination across initiatives
- Final accountability

### Initiative Owners

Different officers can own different workstreams.

Example:

| Company | Initiative | Owner |
|---------|-----------|------|
| Bosch | Internships | Kevin |
| Bosch | Research Collaboration | Rahul |
| Bosch | Guest Lecture | Ananya |
| Bosch | Partnership Renewal | Priya |

### Supporting Officers

Additional collaborators who can:

- View company history
- Log interactions
- Create follow-ups
- Comment on opportunities
- Upload documents

This ownership structure becomes the foundation for every module in CORA.

---

# 8. Product Modules

## Module 1 — Corporate CRM

### Purpose

Maintain a complete record of every company relationship.

### Business Value

Creates a centralized corporate directory with clear ownership and accountability.

### Functional Requirements

### Company Profile

Fields:

- Company name
- Industry
- Company size
- Headquarters
- Website
- Description
- Relationship status
- Primary relationship owner
- Supporting officers
- Tags
- Notes
- Created date
- Last interaction date

### Relationship Status

- Prospect
- Contacted
- Meeting Scheduled
- Discussion
- Proposal
- Negotiation
- Partnership Signed
- Active Partner
- Dormant
- Closed

### Corporate Contacts

Each company can contain multiple contacts.

Fields:

- Name
- Designation
- Department
- Email
- Phone
- LinkedIn
- Preferred communication method
- Primary contact flag

### Company 360° View

Each company page displays:

- Primary owner
- Supporting officers
- Active initiatives
- Contacts
- Recent interactions
- Upcoming follow-ups
- Opportunity pipeline
- Ownership history

### User Stories

As a Corporate Relations Officer,

I want to see who owns a company relationship,

so that I avoid duplicate outreach.

As a Manager,

I want to assign ownership of companies,

so that accountability is clear.

### Acceptance Criteria

- Create company
- Assign primary owner
- Add supporting officers
- View ownership information
- Filter companies by owner
- Search by owner

---

## Module 3 — Interaction Timeline

### Purpose

Capture every meaningful interaction with a company.

### Business Value

Preserves institutional knowledge across multiple officers.

### Interaction Types

- Meeting
- Phone Call
- Email
- Campus Visit
- Guest Lecture
- Workshop
- Partnership Discussion
- Internship Discussion
- Placement Discussion
- Other

### Interaction Fields

- Company
- Contact person
- Date
- Interaction type
- Officer responsible
- Participants
- Meeting notes
- Outcome
- Attachments
- Next action
- Follow-up date

### Timeline View

Interactions appear chronologically with officer attribution.

Example:

Aug 07 — Meeting

Officer: Kevin

Discussed internship expansion.

Aug 05 — Proposal Sent

Officer: Rahul

Shared research collaboration proposal.

Aug 01 — Guest Lecture Confirmation

Officer: Ananya

Confirmed industry lecture schedule.

### Ownership Visibility

Every interaction displays:

- Officer name
- Initiative
- Team ownership
- Related opportunity

### User Stories

As a staff member,

I want every interaction linked to the officer who handled it,

so that relationship history remains clear.

As leadership,

I want to understand which officers are actively engaging companies.

### Acceptance Criteria

- Log interaction
- Attribute interaction to officer
- Link to initiative
- View officer activity timeline
- Filter interactions by officer

---

## Module 4 — Follow-up Automation

### Purpose

Ensure that no relationship becomes inactive due to forgotten follow-ups.

### Business Value

Improves consistency and accountability across officers.

### Follow-up Fields

- Company
- Related interaction
- Assigned officer
- Initiative
- Task title
- Description
- Priority
- Due date
- Status
- Reminder schedule

### Status

- Pending
- In Progress
- Completed
- Cancelled
- Overdue

### Priority

- Low
- Medium
- High
- Critical

### Personal Dashboard

Each officer sees:

- Due today
- Overdue
- This week
- Completed this month
- Companies requiring attention

### Manager Dashboard

Managers see:

- Follow-ups by officer
- Overdue by officer
- Completion rate
- Average response time
- Team workload

### Duplicate Outreach Prevention

Before a new follow-up is created, CORA checks:

- Recent interactions
- Existing follow-ups
- Current initiative owner
- Last communication date

Example warning:

Rahul contacted Bosch regarding internships 3 days ago.

Kevin is the current initiative owner.

Do you still want to create another outreach task?

### User Stories

As an officer,

I want reminders for my assigned companies,

so that I never miss a commitment.

As a Manager,

I want visibility into overdue tasks across the team,

so that important relationships receive attention.

### Acceptance Criteria

- Create follow-up
- Assign officer
- Set due date
- Receive reminder
- Mark completed
- Display overdue items automatically
- Prevent duplicate outreach

---

## Module 5 — Corporate Opportunity Pipeline

### Purpose

Track partnership opportunities from first discussion to execution.

### Business Value

Provides visibility into future collaborations and ownership across officers.

### Opportunity Types

- Internship Program
- Placement Hiring
- Guest Lecture
- Workshop
- Industry Project
- Research Collaboration
- Sponsorship
- MoU
- Hackathon
- Training Program
- Other

### Pipeline Stages

Prospect

Qualified

Meeting

Proposal Sent

Negotiation

Approved

Active

Completed

Lost

### Opportunity Fields

- Company
- Opportunity title
- Type
- Initiative owner
- Supporting officers
- Stage
- Probability
- Expected close date
- Notes
- Related interactions

### Pipeline Views

- Kanban board
- List view
- Stage summary
- Officer summary

### Officer Ownership View

Example:

Kevin

- Bosch Internship Program
- SAP Industry Project
- Microsoft Campus Workshop

Rahul

- Bosch Research Collaboration
- Intel Research Grant

### User Stories

As an officer,

I want ownership of my partnership opportunities,

so that responsibilities are clearly assigned.

As leadership,

I want to know which officer is managing each opportunity.

### Acceptance Criteria

- Create opportunity
- Assign initiative owner
- Move between stages
- Link to company
- Link to interactions
- View pipeline by officer

---

## Module 10 — Executive Analytics Dashboard

### Purpose

Provide leadership with real-time operational visibility across companies and officers.

### Business Value

Eliminates manual reporting and enables strategic management of corporate relationships.

### Dashboard KPIs

## Corporate Overview

- Total companies
- Active partners
- New companies this month
- Dormant companies
- Companies by industry

## Officer Ownership Metrics

- Companies per officer
- Active initiatives per officer
- Opportunities per officer
- Interactions logged per officer
- Follow-ups completed per officer
- Overdue follow-ups per officer

## Interaction Metrics

- Meetings this month
- Emails logged
- Campus visits
- Workshops conducted
- Average interactions per company

## Follow-up Metrics

- Pending follow-ups
- Overdue follow-ups
- Completion rate
- Average completion time

## Opportunity Metrics

- Total opportunities
- Active opportunities
- Opportunities by stage
- Opportunities by owner
- Partnership conversion rate

### Filters

- Date range
- Industry
- Officer
- Company status
- Opportunity type

### Executive Views

## Team Workload

Officer | Companies | Active Initiatives | Overdue

Priya | 34 | 18 | 1

Kevin | 18 | 9 | 0

Rahul | 22 | 11 | 3

Ananya | 15 | 8 | 0

## Relationship Ownership

- Companies without owner
- Companies with multiple initiatives
- Dormant companies by owner
- High-value opportunities by owner

### Reports

Export:

- PDF
- Excel
- CSV

### User Stories

As the Department Head,

I want to see which officer is managing each company,

so that resources can be allocated effectively.

As Administration,

I want ownership-based reports,

so that performance reviews and strategic planning are data-driven.

### Acceptance Criteria

- Dashboard loads in <2 sec
- Officer workload visible
- Ownership filters work
- Reports export successfully
- Charts update dynamically

---

# 9. User Flows

## New Corporate Relationship

Create Company

↓

Assign Primary Owner

↓

Add Supporting Officers

↓

Add Corporate Contacts

↓

Log Initial Interaction

↓

Create Opportunity

↓

Assign Initiative Owner

↓

Create Follow-up

↓

Monitor Pipeline

↓

Generate Dashboard Metrics

## Post-Meeting Workflow

Open Company

↓

Log Meeting Interaction

↓

Record Officer Responsible

↓

Create Next Action

↓

Assign Follow-up

↓

Receive Reminder

↓

Complete Task

↓

Timeline Updated

↓

Executive Dashboard Updated

---

# 10. Functional Requirements

## Authentication

- Google Workspace SSO
- Microsoft 365 SSO
- Role-based authorization
- Session management

## Global Search

Search across:

- Companies
- Contacts
- Officers
- Opportunities
- Interactions
- Follow-ups

## Filters

Companies

- Industry
- Status
- Primary owner
- Supporting officer

Interactions

- Date
- Type
- Officer
- Company

Follow-ups

- Due date
- Officer
- Priority
- Status

Opportunities

- Stage
- Type
- Owner

---

# 11. Data Model

## Company

- id
- name
- industry
- status
- primary_owner_id
- notes
- created_at
- updated_at

## Contact

- id
- company_id
- name
- title
- email
- phone
- linkedin

## User

- id
- name
- email
- role

## RelationshipAssignment

- id
- company_id
- user_id
- assignment_type (PRIMARY, SUPPORT)
- start_date
- end_date
- is_active

## Initiative

- id
- company_id
- name
- type
- owner_id
- status
- priority

## Interaction

- id
- company_id
- contact_id
- officer_id
- initiative_id
- type
- date
- notes
- outcome

## FollowUp

- id
- interaction_id
- company_id
- officer_id
- initiative_id
- title
- due_date
- priority
- status

## Opportunity

- id
- company_id
- initiative_owner_id
- title
- type
- stage
- probability
- expected_close

---

# 12. Security & Privacy

## Access Control

Roles:

- Admin
- Manager
- Officer
- Student Assistant
- Read Only

## Sensitive Data

Protected fields:

- Personal phone numbers
- Email addresses
- Meeting notes
- Partnership negotiations

## Controls

- Encryption at rest
- TLS in transit
- Audit logging
- Export restrictions
- Ownership-based permissions

---


---

# 14. Milestones

## Week 1

- Authentication
- Database schema
- Company management

## Week 2

- Relationship ownership
- Contact management
- Search

## Week 3

- Interaction timeline
- Officer attribution
- Follow-up module

## Week 4

- Opportunity pipeline
- Ownership dashboards

## Week 5

- Executive analytics
- Reports
- Notifications

## Week 6

- Testing
- Security review
- Deployment
- User onboarding

---

# 15. MVP Definition

The MVP is successful when an officer can:

- Create a company
- Assign ownership
- Add contacts
- Record a meeting
- Attribute the interaction to themselves
- Create a follow-up
- Track a partnership opportunity
- View company history
- See upcoming follow-ups
- Generate an ownership dashboard

without using any external spreadsheet.

---

# 16. Expected Business Impact

## Operational

- Replace multiple tracking spreadsheets
- Standardize corporate relationship workflows
- Prevent duplicate outreach
- Improve follow-up discipline
- Preserve institutional knowledge

## Managerial

- Clear ownership for every company
- Transparent officer workload
- Better resource allocation
- Improved accountability

## Strategic

- Increase partnership conversion
- Strengthen corporate engagement consistency
- Enable leadership visibility into relationship health
- Establish the data foundation for future alumni, events, mentorship, and intelligence modules

CORA CRM Core Phase 1 becomes the operational backbone of the Corporate Relations function and introduces a structured ownership model that allows multiple officers to collaborate on the same company without losing coordination, accountability, or relationship continuity.