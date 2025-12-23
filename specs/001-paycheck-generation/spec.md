# Feature Specification: Automated Paycheck Generation & Scheduling

**Feature Branch**: `001-paycheck-generation`
**Created**: 2025-12-23
**Status**: Draft
**Input**: User description: Build an application that allows a store manager to generate the paycheck for all employees. The main goal in the first iteration is to be able to generate the pdf of the invoice of check payment every 15 days of work. It should be configurable. Some of the characteristics of the invoice should include: health insurance contribution, retirement contribution, professional risk contributions, lunch benefit, family benefit, sales percentages, and other possible attributes that can be found in standard paycheck elaborations. The main motivation for this first iteration is the fact that the manager has to recalculate every half month if an employee missed one or more days, so that the manager removes the lunch benefit and the sunday payment (because the employee missed working the whole week between monday and saturday). The idea is to automate these payments. We will include the calculations of the paycheck in specific modules of the application. We might include a feature to be able to change the calculation taking into account the configurations and attributes. It should also have a scheduler feature, that can be connected to fingerprint digital readers, so that the schedule of the employees can be calculated based on their individual skills (two storage employees should not be at the same time schdedule, e.g. in the morning, because one is needed in the morning and the other during the afternoon, because they have the same skillset and activities in the company) and their daily routine registered with a fingerprint in the morning and the afternoon. That registers a full working day for the employee, and goes to the paycheck system as a successful working day.

## User Scenarios & Testing

### User Story 1 - Paycheck Configuration & Generation (Priority: P1)

As a Store Manager, I want to configure paycheck attributes and generate PDF paychecks for a 15-day period so that I don't have to manually calculate deductions and benefits.

**Why this priority**: This is the core value proposition—automating the manual calculation process that is currently prone to error and time-consuming.

**Independent Test**: Can be tested by configuring a set of rules (e.g., 5% health deduction), creating dummy employee data, and generating a PDF that accurately reflects the net pay.

**Acceptance Scenarios**:

1. **Given** a 15-day period with no absences, **When** I generate paychecks, **Then** the PDF includes standard benefits (Lunch, Sunday pay) and deductions (Health, Retirement).
2. **Given** an employee missed 1 day in the period, **When** I generate paychecks, **Then** the Lunch benefit for that day is removed.
3. **Given** an employee missed a full week (Mon-Sat), **When** I generate paychecks, **Then** the Sunday payment is automatically removed.
4. **Given** specific sales percentages for an employee, **When** generated, **Then** the commission is added to the total.

---

### User Story 2 - Automated Scheduling & Conflict Resolution (Priority: P2)

As a Store Manager, I want the system to automatically schedule employees based on their skills so that coverage is optimized and no two employees with identical, singular coverage needs overlap unnecessarily.

**Why this priority**: Ensures operational efficiency and prevents staffing gaps or redundancies (e.g., storage coverage).

**Independent Test**: Define two employees with the same "Storage" skill. Request a schedule. Verify they are not scheduled for the same morning shift if the rule requires split coverage.

**Acceptance Scenarios**:

1. **Given** two employees with the same "Storage" skillset, **When** the schedule is generated, **Then** one is assigned the Morning shift and the other the Afternoon shift (or non-overlapping times as configured).
2. **Given** a list of employees and roles, **When** I run the scheduler, **Then** a conflict-free roster is produced for the pay period.

---

### User Story 3 - Attendance Tracking via Fingerprint Integration (Priority: P3)

As a System, I want to ingest attendance data from fingerprint readers so that "worked days" are automatically registered without manual entry.

**Why this priority**: Connects the physical presence of employees to the logic in User Story 1.

**Independent Test**: Simulate a "fingerprint read" event for Morning and Afternoon. Verify the system marks the day as "Worked".

**Acceptance Scenarios**:

1. **Given** an employee scans their fingerprint in the morning AND afternoon, **When** data is processed, **Then** a full working day is registered.
2. **Given** an employee scans only in the morning (misses afternoon), **When** data is processed, **Then** the day is marked as incomplete/absent (triggering deduction logic).

### Edge Cases

- What happens when a fingerprint reader is offline? (Manual override needed?)
- How does the system handle public holidays within the 15-day period?
- What happens if an employee has a skill that no other employee has (single point of failure in scheduling)?

## Requirements

### Functional Requirements

- **FR-001**: System MUST generate a PDF paycheck for every employee for a selected 15-day period.
- **FR-002**: System MUST allow configuration of global and individual paycheck attributes: Health Insurance, Retirement, Professional Risk, Lunch Benefit, Family Benefit, Sales Percentages.
- **FR-003**: System MUST automatically deduce "Lunch Benefit" for any day marked as absent/incomplete.
- **FR-004**: System MUST automatically remove "Sunday Payment" if the employee was absent for the entire preceding week (Mon-Sat).
- **FR-005**: System MUST ingest attendance logs (timestamp + employee ID) simulating a fingerprint reader interface.
- **FR-006**: System MUST register a "Full Working Day" only if both morning and afternoon check-ins are present for a given date.
- **FR-007**: System MUST generate schedules ensuring employees with the same exclusive skillset (e.g., Storage) are not scheduled in the same time block (Morning vs Afternoon) unless configuration allows.
- **FR-008**: System MUST allow manual override of attendance records before paycheck generation.

### Key Entities

- **Employee**: ID, Name, Skills (List), Role, Base Salary, Sales % config.
- **PaycheckConfig**: Global rules for Health %, Retirement %, Lunch value, Sunday value.
- **AttendanceLog**: EmployeeID, Timestamp, Type (In/Out).
- **WorkDay**: EmployeeID, Date, Status (Complete, Incomplete, Absent).
- **Schedule**: EmployeeID, Date, Shift (Morning/Afternoon).

## Success Criteria

### Measurable Outcomes

- **SC-001**: Manager can generate valid paychecks for 50 employees in under 5 minutes.
- **SC-002**: 100% of attendance-based deductions (Lunch/Sunday) are calculated correctly based on ingested logs.
- **SC-003**: Schedule generation results in 0 conflicts for "Storage" skill overlap.
- **SC-004**: System successfully ingests simulated fingerprint data for 100% of active employees.