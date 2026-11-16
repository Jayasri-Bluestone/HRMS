# OmniHRMS - Multi-Tenant SaaS & International Payroll Web Application

Built according to the **HRMS & Payroll SaaS Project Specification (Version 1.0)** for internal deployment at **Bluestone Group** and commercial multi-tenant SaaS expansion.

---

## 🌟 Key Features Implemented

### 1. Multi-Tenant SaaS Architecture
- **Tenant Isolation**: Independent workspace schemas, currency, timezone, employee seat limits, and country rules.
- **Tenant Switcher**: Seamlessly switch between **Bluestone Group (India)**, **Bluestone Middle East LLC (UAE)**, **FinTech Global Ltd (UK)**, and **Apex Innovations (Singapore)**.
- **Plan Quota Monitoring**: Visual capacity bar monitoring employee count against subscription limits.

### 2. Multi-Role RBAC (Role Simulator)
Switch instantly between all 5 project roles using the Topbar Role Selector:
- **SaaS Super Admin**: Platform console, MRR/ARR charts, tenant provisioning, cross-tenant stats.
- **Company Admin**: Executive company overview, department distributions, subscription management.
- **HR Admin**: Workforce directory, onboarding wizard, attendance audit, leave management, multi-country payroll execution.
- **Manager**: Squad direct reports, today's team attendance, one-click leave approvals/rejections.
- **Employee (ESS)**: Daily GPS geofenced punch in/out with working hours clock, leave balance cards, and official payslip download.

### 3. International Payroll Rules Engine
- **Jurisdiction Adapters**:
  - **India**: Basic, HRA, Transport Allowances, EPF (12%), TDS, Professional Tax.
  - **UAE**: Wages Protection System (WPS) surcharge, gratuity allocation, 0% income tax.
  - **UK**: PAYE Income Tax, Class 1 National Insurance, Workplace Pension.
  - **Singapore**: CPF, CDAC/SINDA, Skills Development Levy.
- **4-Step Monthly Payroll Wizard**: Period scope -> Country rule validation -> Calculation & exception audit -> Immutable approval lock & disburse.
- **Official Payslips**: Digitally verifiable PDF modal with company details, earnings, statutory deductions, net take-home, and bank account metadata.

### 4. Attendance & Geofenced Punching
- Mobile & web punch simulation with GPS coordinates and IP validation.
- Real-time work hours tracking.
- Attendance exception markers (e.g., remote punches, late arrivals) with resolution workflow.

### 5. Leave Management Workflow
- Policies and accruals (Annual, Sick, Casual, LOP).
- Employee application form with balance deduction.
- Manager & HR approval pipeline.

### 6. SaaS Billing & Subscriptions
- Tier comparisons: Starter (up to 25 seats), Growth (up to 150 seats), Enterprise (custom).
- Monthly / Annual toggle (with 2 months discount).
- Automated invoice history ledger.

### 7. Audit Trail & Compliance
- Tamper-evident ledger capturing user, action, module, timestamp (UTC), IP, and state change snapshots.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 10+

### Installation & Run

```bash
# Navigate to web application directory
cd HRMS-Frontend

# Install dependencies (already installed)
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
HRMS-Frontend/
├── src/
│   ├── components/
│   │   ├── common/         # Badge, StatCard, Modal
│   │   └── layout/         # Sidebar, Topbar, Layout
│   ├── contexts/           # AuthContext (RBAC), TenantContext (Multi-Tenancy)
│   ├── mockData/           # Companies, Employees, Attendance, Leaves, Payroll, Subscriptions
│   ├── modules/
│   │   ├── dashboard/      # SuperAdmin, HR, Manager, Employee Dashboards
│   │   ├── employees/      # Directory, Add Employee Modal, Detail Modal
│   │   ├── attendance/     # GPS punch ledger, shift exceptions
│   │   ├── leave/          # Leave approvals, policy accruals
│   │   ├── payroll/        # Country engine, 4-step wizard, payslip viewer
│   │   ├── billing/        # Plans, capacity limits, invoices
│   │   └── audit/          # Security and compensation audit trail
│   ├── types/              # TypeScript domain models
│   ├── App.tsx             # Root route and role dispatcher
│   ├── index.css           # Tailwind CSS
│   └── main.tsx            # Application entry
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

