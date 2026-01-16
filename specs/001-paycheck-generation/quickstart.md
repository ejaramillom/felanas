# Quickstart: Paycheck Generation

## Prerequisites
1.  Ensure you have at least 2 employees in the database.
2.  Ensure `PaycheckConfig` is set for your company.

## 1. Simulate Attendance
Manually insert logs for an employee (Morning + Afternoon) to ensure a full day is registered.
```bash
# Example SQL
INSERT INTO attendance_log (employee_id, company_id, timestamp, type) VALUES ('...', '...', '2025-01-01 08:00:00', 'IN');
INSERT INTO attendance_log (employee_id, company_id, timestamp, type) VALUES ('...', '...', '2025-01-01 17:00:00', 'OUT');
```

## 2. Generate Paychecks
Trigger the generation for the first half of January.
```bash
curl -X POST http://localhost:3000/paychecks/generate \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"startDate": "2025-01-01", "endDate": "2025-01-15"}'
```

## 3. Verify Output
List the paychecks and download one.
```bash
curl http://localhost:3000/paychecks -H "Authorization: Bearer <TOKEN>"
# Take an ID
curl http://localhost:3000/paychecks/<ID>/pdf -o paycheck.pdf
```
Open `paycheck.pdf` and verify calculations.
