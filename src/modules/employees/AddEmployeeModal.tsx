import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Employee, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useHrmsData } from '../../contexts/HrmsDataContext';
import {
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Building,
  CreditCard,
  ShieldCheck,
  User,
  Heart,
  Landmark,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  BadgeCheck
} from 'lucide-react';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (emp: Employee, credentials?: { password?: string; role?: UserRole; shiftId?: string }) => void;
}

type StepTab = 'employment' | 'bank' | 'statutory' | 'portal';

const POPULAR_BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Standard Chartered',
  'Citibank',
  'Emirates NBD',
  'First Abu Dhabi Bank',
  'Barclays',
  'HSBC',
  'Other / Custom Bank'
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onAddEmployee
}) => {
  const { currentRole } = useAuth();
  const { currentTenant, allTenants } = useTenant();
  const { departments, designations, shifts, branches, employees } = useHrmsData();
  const isSuperAdmin = currentRole === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<StepTab>('employment');
  const [targetTenantId, setTargetTenantId] = useState(currentTenant.id);

  // Form State
  const [formData, setFormData] = useState({
    // Tab 1: Employment
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: departments[0]?.name || 'Engineering',
    designation: designations[0]?.title || 'Software Engineer',
    managerName: 'Vikram Sharma',
    employmentType: 'FULL_TIME' as 'FULL_TIME' | 'PROBATION' | 'CONTRACT' | 'INTERN',
    workLocation: branches[0]?.name ? `${branches[0].name} (${branches[0].location})` : 'Corporate HQ',
    joiningDate: new Date().toISOString().split('T')[0],

    // Tab 2: Compensation & Bank Details
    monthlyGross: '85000',
    selectedBank: 'HDFC Bank',
    customBankName: '',
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscOrIban: 'HDFC0001234',

    // Tab 3: Statutory & PF Compliance
    hasExistingPf: false,
    existingPfNumber: '',
    uanNumber: '',
    esiNumber: '',
    panNumber: '',
    nationalId: '',

    // Tab 4: Portal & Personal
    enablePortalAccess: true,
    portalRole: 'EMPLOYEE' as UserRole,
    assignedShiftId: shifts[0]?.id || 'sh-1',
    password: 'Welcome@123',
    showPassword: false,
    dateOfBirth: '1996-06-20',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    bloodGroup: 'B+',
    maritalStatus: 'SINGLE' as 'SINGLE' | 'MARRIED' | 'OTHER',
    emergencyContactName: '',
    emergencyContactPhone: '',
    currentAddress: ''
  });

  const targetTenant = allTenants.find((t) => t.id === targetTenantId) || currentTenant;

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let gen = 'Hrms@';
    for (let i = 0; i < 4; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: gen }));
  };

  // Salary calculations
  const gross = parseFloat(formData.monthlyGross) || 0;
  const basic = Math.round(gross * 0.5);
  const allowances = Math.round(gross * 0.4);
  const deductions = Math.round(gross * 0.1);
  const netPay = gross - deductions;

  // Account match status
  const effectiveBankName =
    formData.selectedBank === 'Other / Custom Bank'
      ? formData.customBankName.trim() || 'Custom Bank'
      : formData.selectedBank;

  const effectiveHolderName =
    formData.accountHolderName.trim() ||
    `${formData.firstName} ${formData.lastName}`.trim() ||
    'Employee Name';

  const accountMismatch =
    formData.confirmAccountNumber.length > 0 &&
    formData.accountNumber !== formData.confirmAccountNumber;

  const accountMatchVerified =
    formData.accountNumber.length > 5 &&
    formData.accountNumber === formData.confirmAccountNumber;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (accountMismatch) {
      setActiveTab('bank');
      alert('Bank Account Number and Confirmation Number do not match. Please verify.');
      return;
    }

    const newEmp: Employee = {
      id: `emp-${Date.now().toString().slice(-4)}`,
      tenantId: targetTenant.id,
      employeeCode: `${targetTenant.code.slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      firstName: formData.firstName.trim() || 'Jane',
      lastName: formData.lastName.trim() || 'Doe',
      email: formData.email.trim().toLowerCase() || 'employee@company.com',
      phone: formData.phone.trim() || '+91 99999 88888',
      department: formData.department,
      designation: formData.designation,
      managerName: formData.managerName,
      joiningDate: formData.joiningDate,
      status: formData.employmentType === 'PROBATION' ? 'PROBATION' : 'ACTIVE',
      avatar:
        formData.gender === 'FEMALE'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      country: targetTenant.countryId,
      currency: targetTenant.currency,
      salary: {
        monthlyGross: gross,
        basic,
        allowances,
        deductions,
        netPay
      },
      bankDetails: {
        accountNumber: formData.accountNumber
          ? formData.accountNumber.length > 4
            ? `**** **** ${formData.accountNumber.slice(-4)}`
            : formData.accountNumber
          : '**** **** 5566',
        bankName: effectiveBankName,
        ifscOrIban: formData.ifscOrIban.toUpperCase().trim() || 'HDFC0001234',
        accountHolderName: effectiveHolderName
      },
      statutoryDetails: {
        hasExistingPf: formData.hasExistingPf,
        pfNumber: formData.hasExistingPf
          ? formData.existingPfNumber.trim() || 'MH/BAN/0012345/000/0001234'
          : undefined,
        uanNumber: formData.uanNumber.trim() || (formData.hasExistingPf ? '101234567890' : undefined),
        esiNumber: formData.esiNumber.trim() || undefined,
        panNumber: formData.panNumber.toUpperCase().trim() || 'ABCDE1234F',
        nationalId: formData.nationalId.trim() || undefined
      },
      personalDetails: {
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        bloodGroup: formData.bloodGroup,
        maritalStatus: formData.maritalStatus,
        workLocation: formData.workLocation,
        employmentType: formData.employmentType,
        emergencyContactName: formData.emergencyContactName.trim() || undefined,
        emergencyContactPhone: formData.emergencyContactPhone.trim() || undefined,
        currentAddress: formData.currentAddress.trim() || undefined
      },
      documentsCount: 2
    };

    onAddEmployee(newEmp, {
      password: formData.password.trim() || 'Welcome@123',
      role: formData.portalRole,
      shiftId: formData.assignedShiftId
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Employee"
      subtitle={`Comprehensive Onboarding into ${targetTenant.name} (${targetTenant.countryId} Node)`}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Super Admin Tenant Override */}
        {isSuperAdmin && (
          <div className="p-3 bg-amber-500/10 border border-amber-300/60 rounded-xl">
            <label className="block text-xs font-bold text-amber-900 mb-1">
              Target Tenant Company Node *
            </label>
            <select
              aria-label="Target Tenant Company"
              value={targetTenantId}
              onChange={(e) => setTargetTenantId(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-white font-semibold text-slate-800"
            >
              {allTenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.countryId} • {t.currency})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Wizard Segmented Navigation Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('employment')}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === 'employment'
                ? 'border-[#ff7a1a] text-[#ff7a1a]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            1. Employment & Role
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bank')}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === 'bank'
                ? 'border-[#ff7a1a] text-[#ff7a1a]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            2. Bank & Salary
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('statutory')}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === 'statutory'
                ? 'border-[#ff7a1a] text-[#ff7a1a]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            3. PF & Statutory Compliance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('portal')}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === 'portal'
                ? 'border-[#ff7a1a] text-[#ff7a1a]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            4. Portal & Personal
          </button>
        </div>

        {/* TAB 1: EMPLOYMENT & ROLE */}
        {activeTab === 'employment' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Rahul"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Sharma"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Email (Login ID) *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-white font-medium text-slate-800"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} {d.code ? `(${d.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designation *</label>
                <input
                  type="text"
                  list="master-designations-list"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Senior Frontend Dev"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] font-medium"
                />
                <datalist id="master-designations-list">
                  {designations.map((des) => (
                    <option key={des.id} value={des.title} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reporting Manager</label>
                <input
                  type="text"
                  list="existing-managers-list"
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                />
                <datalist id="existing-managers-list">
                  {employees.map((emp) => (
                    <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type *</label>
                <select
                  value={formData.employmentType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employmentType: e.target.value as any
                    })
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-white font-medium text-slate-800"
                >
                  <option value="FULL_TIME">Full Time Permanent</option>
                  <option value="PROBATION">Probationary Period</option>
                  <option value="CONTRACT">Fixed-term Contract</option>
                  <option value="INTERN">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Location / Branch</label>
                <select
                  value={formData.workLocation}
                  onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-white font-medium text-slate-800"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={`${b.name} (${b.location})`}>
                      {b.flag} {b.name} - {b.location}
                    </option>
                  ))}
                  <option value="Remote / Work From Home">🏡 Remote / Work From Home</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Joining Date *</label>
                <input
                  type="date"
                  required
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPENSATION & BANK ACCOUNT */}
        {activeTab === 'bank' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            {/* Compensation & Live Breakdown */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800">
                    Monthly Gross CTC ({targetTenant.currencySymbol} {targetTenant.currency}) *
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Statutory gross amount before tax and retirement deductions.
                  </p>
                </div>
                <div className="w-full sm:w-48">
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.monthlyGross}
                    onChange={(e) => setFormData({ ...formData, monthlyGross: e.target.value })}
                    className="w-full text-sm font-bold px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] text-right font-mono text-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Live Statutory Breakdown Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Basic (50%)</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {targetTenant.currencySymbol} {basic.toLocaleString()}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Allowances / HRA</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {targetTenant.currencySymbol} {allowances.toLocaleString()}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">PF/Tax Deductions</span>
                  <span className="font-bold text-rose-600 font-mono">
                    - {targetTenant.currencySymbol} {deductions.toLocaleString()}
                  </span>
                </div>
                <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <span className="text-emerald-700 block font-semibold">Est. Net Take-Home</span>
                  <span className="font-extrabold text-emerald-700 font-mono">
                    {targetTenant.currencySymbol} {netPay.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Details Inputs */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#ff7a1a]" />
                <h4 className="text-xs font-bold text-slate-900">Direct Deposit Bank Account Details</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Bank *</label>
                  <select
                    value={formData.selectedBank}
                    onChange={(e) => setFormData({ ...formData, selectedBank: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-white font-medium text-slate-800"
                  >
                    {POPULAR_BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.selectedBank === 'Other / Custom Bank' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Custom Bank Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.customBankName}
                      onChange={(e) => setFormData({ ...formData, customBankName: e.target.value })}
                      placeholder="e.g. Federal Bank Ltd"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Account Holder Full Name</label>
                    <input
                      type="text"
                      value={formData.accountHolderName}
                      onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                      placeholder={
                        `${formData.firstName} ${formData.lastName}`.trim() || 'Name as per bank passbook'
                      }
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                    />
                  </div>
                )}
              </div>

              {formData.selectedBank === 'Other / Custom Bank' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Holder Full Name</label>
                  <input
                    type="text"
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                    placeholder={
                      `${formData.firstName} ${formData.lastName}`.trim() || 'Name as per bank passbook'
                    }
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bank Account Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="e.g. 50100234567891"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Confirm Account Number *</label>
                    {accountMatchVerified && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Numbers Match
                      </span>
                    )}
                    {accountMismatch && (
                      <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5">
                        <AlertCircle className="w-3 h-3" /> Mismatch Warning
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.confirmAccountNumber}
                    onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value })}
                    placeholder="Re-enter bank account number"
                    className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 font-mono ${
                      accountMismatch
                        ? 'border-rose-400 bg-rose-50/50 focus:ring-rose-500 text-rose-900'
                        : accountMatchVerified
                        ? 'border-emerald-400 bg-emerald-50/30 focus:ring-emerald-500'
                        : 'border-slate-300 focus:ring-[#ff7a1a]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  IFSC Code / Branch Code / IBAN *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ifscOrIban}
                  onChange={(e) => setFormData({ ...formData, ifscOrIban: e.target.value.toUpperCase() })}
                  placeholder="e.g. HDFC0001234 or AE0703312345678901234"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] font-mono uppercase"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Used for automated NEFT/RTGS/IMPS salary disbursement and statutory WPS compliance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PF & STATUTORY COMPLIANCE */}
        {activeTab === 'statutory' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            {/* PF / EPF Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#181a20] text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-[#ff7a1a]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">
                      Provident Fund (EPF) & UAN Compliance
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Employees' Provident Fund Organisation (EPFO) statutory enrollment.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  Statutory Rule 1952
                </span>
              </div>

              {/* PF Member Status Choice */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Does the employee already have an active PF / EPF account from prior employment? *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hasExistingPf: true })}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formData.hasExistingPf
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-500/30'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${formData.hasExistingPf ? 'text-emerald-600' : 'text-slate-400'}`}
                    />
                    Yes — Existing PF Member
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hasExistingPf: false })}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      !formData.hasExistingPf
                        ? 'bg-amber-50 border-amber-400 text-amber-800 ring-2 ring-amber-500/30'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <BadgeCheck
                      className={`w-4 h-4 ${!formData.hasExistingPf ? 'text-amber-600' : 'text-slate-400'}`}
                    />
                    No — Fresh EPF Registration
                  </button>
                </div>
              </div>

              {formData.hasExistingPf ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Existing Member PF Number *
                    </label>
                    <input
                      type="text"
                      required={formData.hasExistingPf}
                      value={formData.existingPfNumber}
                      onChange={(e) => setFormData({ ...formData, existingPfNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g. MH/BAN/0012345/000/0007890"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] font-mono uppercase"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Includes Region Code, Est ID, Extension, and Member ID.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      12-Digit Universal Account Number (UAN) *
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      required={formData.hasExistingPf}
                      value={formData.uanNumber}
                      onChange={(e) => setFormData({ ...formData, uanNumber: e.target.value.replace(/\D/g, '') })}
                      placeholder="e.g. 101234567890"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] font-mono tracking-wider"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Enables continuous electronic transfer across employers.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-amber-900 leading-relaxed">
                    <span className="font-bold">New EPF Member Enrollment:</span> When onboarded, the system
                    provisions a new EPF Member ID under the company establishment code. A fresh 12-digit UAN
                    will be generated upon first payroll filing.
                  </div>
                </div>
              )}
            </div>

            {/* Tax & National Identification Cards */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" /> Government IDs & Tax Compliance
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    PAN Card (Permanent Account Number) *
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    required
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. ABCDE1234F"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] font-mono uppercase"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Required for Income Tax Form 16 / TDS deduction.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ESI Insurance Number (17 digits)
                  </label>
                  <input
                    type="text"
                    value={formData.esiNumber}
                    onChange={(e) => setFormData({ ...formData, esiNumber: e.target.value })}
                    placeholder="e.g. 31-00-123456-000-0001"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {gross > 21000 ? 'Gross > ₹21k: Exempt or Enter if active' : 'Mandatory for Gross ≤ ₹21,000'}
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Aadhaar / National ID Card
                  </label>
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    placeholder="e.g. 4567 8901 2345"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    National ID identity verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PORTAL CREDENTIALS & PERSONAL DETAILS */}
        {activeTab === 'portal' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            {/* Portal Credentials Section */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#181a20] text-white flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-[#ff7a1a]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Portal Access & Credentials</h4>
                    <p className="text-[11px] text-slate-500">
                      Provision role-based access for the employee to sign in to their dedicated portal.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Auto-Provisioning
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Portal System Role *</label>
                  <select
                    value={formData.portalRole}
                    onChange={(e) => setFormData({ ...formData, portalRole: e.target.value as UserRole })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-white font-semibold text-slate-800"
                  >
                    <option value="EMPLOYEE">Employee (Self-Service ESS)</option>
                    <option value="MANAGER">Manager (Squad & Reports Workspace)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Shift Schedule *</label>
                  <select
                    value={formData.assignedShiftId}
                    onChange={(e) => setFormData({ ...formData, assignedShiftId: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-white font-semibold text-slate-800"
                  >
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Portal Login Username</label>
                  <input
                    type="text"
                    disabled
                    value={formData.email || 'employee@company.com'}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700">Initial Password *</label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[10px] font-bold text-[#c2410c] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Sparkles className="w-2.5 h-2.5" /> Auto-Generate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={formData.showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="e.g. Welcome@123"
                      className="w-full text-xs pl-3 pr-8 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, showPassword: !formData.showPassword })}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {formData.showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Demographics & Emergency */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> Personal Demographics & Emergency Contact
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-white"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other / Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-white font-bold text-slate-800"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Marital Status</label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value as any })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-white"
                  >
                    <option value="SINGLE">Single</option>
                    <option value="MARRIED">Married</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Emergency Contact Name (Spouse / Parent)
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    placeholder="e.g. Sunita Sharma (Mother)"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    placeholder="+91 98112 00000"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={formData.currentAddress}
                  onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                  placeholder="e.g. 402 Palm Heights, Powai, Mumbai - 400076"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div>
            {activeTab !== 'employment' && (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'bank') setActiveTab('employment');
                  else if (activeTab === 'statutory') setActiveTab('bank');
                  else if (activeTab === 'portal') setActiveTab('statutory');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>

            {activeTab !== 'portal' ? (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'employment') setActiveTab('bank');
                  else if (activeTab === 'bank') setActiveTab('statutory');
                  else if (activeTab === 'statutory') setActiveTab('portal');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                Next Step <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#ff7a1a] hover:bg-[#ea580c] shadow-md hover:shadow-lg rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Complete Onboarding & Issue Invite
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
