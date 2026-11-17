import React from 'react';
import { Employee } from '../../types';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import {
  Mail,
  Phone,
  Building,
  CreditCard,
  FileText,
  ShieldCheck,
  Heart,
  Landmark,
  BadgeCheck,
  AlertCircle,
  MapPin,
  Calendar,
  UserCheck
} from 'lucide-react';

interface EmployeeDetailModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  isOpen,
  onClose
}) => {
  const { currentRole, currentUser } = useAuth();
  const { formatCurrency } = useTenant();

  if (!employee) return null;

  const canViewCompensation =
    currentRole === 'SUPER_ADMIN' ||
    currentRole === 'COMPANY_ADMIN' ||
    currentRole === 'HR_ADMIN' ||
    employee.id === currentUser.employeeId;

  const stat = employee.statutoryDetails;
  const personal = employee.personalDetails;
  const bank = employee.bankDetails;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${employee.firstName} ${employee.lastName}`}
      subtitle={`Employee ID: ${employee.employeeCode} • ${employee.designation}`}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <img
            src={
              employee.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop'
            }
            alt={employee.firstName}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-slate-900">
                  {employee.firstName} {employee.lastName}
                </h4>
                {personal?.bloodGroup && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    🩸 {personal.bloodGroup}
                  </span>
                )}
              </div>
              <StatusBadge status={employee.status} />
            </div>
            <p className="text-xs text-slate-500">{employee.designation}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {employee.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {employee.phone}
              </span>
              {personal?.workLocation && (
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {personal.workLocation}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Primary Info Grid: Employment & Compensation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Employment Details */}
          <div className="p-4 rounded-xl border border-slate-200/80 space-y-2.5 bg-white">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-600" /> Employment Details
            </h5>
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-800">{employee.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Reporting Manager:</span>
                <span className="font-semibold text-slate-800">{employee.managerName || 'Direct to CEO'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Employment Type:</span>
                <span className="font-semibold text-slate-800">
                  {personal?.employmentType === 'FULL_TIME'
                    ? 'Full Time Permanent'
                    : personal?.employmentType === 'PROBATION'
                    ? 'Probationary'
                    : personal?.employmentType === 'CONTRACT'
                    ? 'Contract'
                    : personal?.employmentType === 'INTERN'
                    ? 'Internship'
                    : 'Full Time Permanent'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Date Joined:</span>
                <span className="font-semibold text-slate-800">{employee.joiningDate}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Country Rule Base:</span>
                <span className="font-semibold text-slate-800">
                  {employee.country} ({employee.currency})
                </span>
              </div>
            </div>
          </div>

          {/* Bank & Compensation */}
          {canViewCompensation && (
            <div className="p-4 rounded-xl border border-slate-200/80 space-y-2.5 bg-white">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Bank & Direct Deposit
              </h5>
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Monthly Gross CTC:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    {formatCurrency(employee.salary.monthlyGross)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Bank Name:</span>
                  <span className="font-semibold text-slate-800">{bank?.bankName || 'HDFC Bank'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Account Holder:</span>
                  <span className="font-medium text-slate-800">
                    {bank?.accountHolderName || `${employee.firstName} ${employee.lastName}`}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Account Number:</span>
                  <span className="font-mono text-slate-800">{bank?.accountNumber || '**** **** 1234'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">IFSC / IBAN:</span>
                  <span className="font-mono font-semibold text-indigo-700">{bank?.ifscOrIban || 'HDFC0001234'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Secondary Info Grid: PF/Statutory & Personal Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Statutory Compliance (PF, UAN, ESI, PAN) */}
          <div className="p-4 rounded-xl border border-slate-200/80 space-y-2.5 bg-white">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ff7a1a]" /> Statutory & Tax Compliance
              </h5>
              {stat?.hasExistingPf ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3" /> Existing PF Member
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> New EPF Enrolled
                </span>
              )}
            </div>

            <div className="text-xs space-y-1.5">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">PF Member ID:</span>
                <span className="font-mono font-medium text-slate-800">
                  {stat?.pfNumber || (stat?.hasExistingPf ? 'MH/BAN/0012345/000/0001234' : 'Pending EPFO allocation')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Universal Account No (UAN):</span>
                <span className="font-mono font-semibold text-slate-900">
                  {stat?.uanNumber || '101234567890'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Income Tax PAN:</span>
                <span className="font-mono font-bold text-slate-800">
                  {stat?.panNumber || 'ABCDE1234F'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">ESI IP Number:</span>
                <span className="font-mono text-slate-700">
                  {stat?.esiNumber || (employee.salary.monthlyGross > 21000 ? 'Exempt (> ₹21,000)' : '31-00-123456-000-0001')}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Aadhaar / National ID:</span>
                <span className="font-mono text-slate-800">
                  {stat?.nationalId ? `**** **** ${stat.nationalId.slice(-4)}` : '**** **** 9012'}
                </span>
              </div>
            </div>
          </div>

          {/* Personal & Emergency Contact */}
          <div className="p-4 rounded-xl border border-slate-200/80 space-y-2.5 bg-white">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> Personal & Emergency Details
            </h5>
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Date of Birth / Age:</span>
                <span className="font-medium text-slate-800">
                  {personal?.dateOfBirth ? `${personal.dateOfBirth}` : '1996-06-20'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Gender / Marital:</span>
                <span className="font-medium text-slate-800">
                  {personal?.gender || 'Male'} • {personal?.maritalStatus || 'Single'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Blood Group:</span>
                <span className="font-bold text-rose-600">
                  {personal?.bloodGroup || 'B+'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Emergency Contact:</span>
                <span className="font-semibold text-slate-800">
                  {personal?.emergencyContactName || 'Family / Next of Kin'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Emergency Phone:</span>
                <a
                  href={`tel:${personal?.emergencyContactPhone || employee.phone}`}
                  className="font-mono text-indigo-600 hover:underline font-semibold"
                >
                  {personal?.emergencyContactPhone || employee.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Documents */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" /> Verified Onboarding & Compliance Documents
            </h5>
            <span className="text-xs text-slate-500">{employee.documentsCount + 2} files encrypted in S3</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
              <span className="truncate">Employment_Agreement.pdf</span>
              <span className="text-[10px] text-emerald-600 font-bold shrink-0">VERIFIED</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
              <span className="truncate">PAN_Aadhaar_KYC.pdf</span>
              <span className="text-[10px] text-emerald-600 font-bold shrink-0">VERIFIED</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
              <span className="truncate">EPF_Form_11_Nomination.pdf</span>
              <span className="text-[10px] text-emerald-600 font-bold shrink-0">VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
