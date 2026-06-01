# SmartHR — HRIS Platform

## Overview

SmartHR is a comprehensive Human Resource Information System (HRIS) built for
small-to-medium enterprises. It centralises employee data, payroll, attendance,
leave management, recruitment, and HR operations into a single web application.
HR administrators manage the workforce end-to-end; employees self-serve their
personal records, payslips, leave requests, and support tickets.

## Goals

1. Provide a single source of truth for all employee and organisational data.
2. Automate routine HR processes: leave approvals, attendance tracking, payroll
   computation, and recruitment pipeline.
3. Give employees transparent, real-time access to their own HR records.
4. Enable HR managers and super-admins to report across the full organisation.

## Core User Flow

### Admin / HR Manager
1. Admin signs in → lands on Admin Dashboard (KPI tiles, recent activity, charts)
2. Navigates via left sidebar to any module (Employees, Leaves, Attendance, Payroll, etc.)
3. Creates / edits records (employees, departments, jobs, leaves, payroll)
4. Approves / rejects employee requests (leaves, expenses, tickets)
5. Runs and exports reports

### Employee
1. Employee signs in → lands on Employee Dashboard (personal stats, upcoming tasks)
2. Views personal profile, payslips, attendance summary
3. Submits leave requests, expense claims, support tickets
4. Tracks approval status

## Features

### Core HR
- Employee directory (grid + list view, search, filters)
- Employee profile (personal info, work info, assets, timeline)
- Departments & Designations management
- Org chart

### Attendance & Leave
- Attendance tracking (clock in/out, daily/monthly view)
- Leave types configuration
- Leave requests — submit, approve, reject, cancel
- Leave balance dashboard

### Payroll
- Salary configuration per employee
- Payslip generation and download
- Provident fund management
- Expense claims
- Payment history

### Recruitment
- Job postings (grid view, status: open/closed/draft)
- Candidate pipeline (grid cards, status tracking)
- Referrals management

### Support / Ticketing
- Employee support tickets (open, in-progress, resolved)
- Ticket detail with threaded comments

### Reports
- Employee report, attendance report, leave report
- Payslip report, payment report, expense report
- Daily/project/task reports
- User activity report

### Auth
- Register, Login, Forgot Password, Reset Password
- Email verification, 2-step verification

## Scope

### In Scope
- All modules listed above as React SPA
- Role-based views: Super Admin, HR Admin, Employee
- Full CRUD for all entities
- Report views (display + export trigger)
- Responsive layout (desktop-first, tablet-friendly)

### Out of Scope
- Native mobile app
- Real-time chat / messaging beyond ticket threads
- Third-party payroll integrations (e.g. ADP, Gusto) in v1
- Biometric / hardware attendance device integration in v1

## Success Criteria

1. An admin can onboard a new employee end-to-end (create profile → assign dept/designation → set salary).
2. An employee can submit a leave request and track it to approval.
3. Payroll can be processed and payslips downloaded for any pay period.
4. All reports render filtered data and support CSV export.
5. Auth flow (register → verify email → 2FA → login → reset password) works completely.
