import React from 'react';
import { Employee } from '../../types';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import {
  Mail,
  Phone,
  Briefcase,
  Building,
  Calendar,
  CreditCard,
  FileText,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${employee.firstName} ${employee.lastName}`}
      subtitle={`Employee ID: ${employee.employeeCode} • ${employee.designation}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <img
            src={employee.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop'}
            alt={employee.firstName}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/30"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900">
                {employee.firstName} {employee.lastName}
              </h4>
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
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200/80 space-y-2.5">
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
                <span className="text-slate-500">Date Joined:</span>
                <span className="font-semibold text-slate-800">{employee.joiningDate}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Country Rule Base:</span>
                <span className="font-semibold text-slate-800">{employee.country} ({employee.currency})</span>
              </div>
            </div>
          </div>

          {canViewCompensation && (
            <div className="p-4 rounded-xl border border-slate-200/80 space-y-2.5">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Bank & Compensation
              </h5>
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Monthly Gross CTC:</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(employee.salary.monthlyGross)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Basic Component:</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(employee.salary.basic)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Bank Name:</span>
                  <span className="font-semibold text-slate-800">{employee.bankDetails?.bankName || 'HDFC Bank'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Account (Masked):</span>
                  <span className="font-mono text-slate-800">{employee.bankDetails?.accountNumber || '**** **** 1234'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Uploaded Documents */}
        <div className="p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" /> Verified Onboarding Documents
            </h5>
            <span className="text-xs text-slate-500">{employee.documentsCount} files encrypted in S3</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
              <span className="truncate">Employment_Contract.pdf</span>
              <span className="text-[10px] text-emerald-600 font-bold">VERIFIED</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
              <span className="truncate">National_ID_Passport.pdf</span>
              <span className="text-[10px] text-emerald-600 font-bold">VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

