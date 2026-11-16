import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Employee } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useHrmsData } from '../../contexts/HrmsDataContext';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (emp: Employee) => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onAddEmployee
}) => {
  const { currentRole } = useAuth();
  const { currentTenant, allTenants, countryConfig } = useTenant();
  const { departments, designations } = useHrmsData();
  const isSuperAdmin = currentRole === 'SUPER_ADMIN';

  const [targetTenantId, setTargetTenantId] = useState(currentTenant.id);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: departments[0]?.name || 'Engineering',
    designation: designations[0]?.title || 'Software Engineer',
    managerName: 'Vikram Sharma',
    monthlyGross: '85000',
    joiningDate: new Date().toISOString().split('T')[0]
  });

  const targetTenant = allTenants.find((t) => t.id === targetTenantId) || currentTenant;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gross = parseFloat(formData.monthlyGross) || 50000;
    const basic = Math.round(gross * 0.5);
    const allowances = Math.round(gross * 0.4);
    const deductions = Math.round(gross * 0.1);

    const newEmp: Employee = {
      id: `emp-${Date.now().toString().slice(-4)}`,
      tenantId: targetTenant.id,
      employeeCode: `${targetTenant.code.slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      firstName: formData.firstName || 'Jane',
      lastName: formData.lastName || 'Doe',
      email: formData.email || 'employee@company.com',
      phone: formData.phone || '+91 99999 88888',
      department: formData.department,
      designation: formData.designation,
      managerName: formData.managerName,
      joiningDate: formData.joiningDate,
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      country: targetTenant.countryId,
      currency: targetTenant.currency,
      salary: {
        monthlyGross: gross,
        basic,
        allowances,
        deductions,
        netPay: gross - deductions
      },
      bankDetails: {
        accountNumber: '**** **** 5566',
        bankName: 'Standard Chartered',
        ifscOrIban: 'SCBL0001122'
      },
      documentsCount: 2
    };

    onAddEmployee(newEmp);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Employee"
      subtitle={`Onboard new employee into ${targetTenant.name} (${targetTenant.countryId} Node)`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSuperAdmin && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Tenant Company *
            </label>
            <select
              aria-label="Target Tenant Company"
              value={targetTenantId}
              onChange={(e) => setTargetTenantId(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-amber-50/50 font-semibold text-slate-800"
            >
              {allTenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.countryId} - {t.currency})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Super Admin override: Employee will be provisioned directly into this tenant roster with localized statutory rules.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="e.g. Rahul"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="e.g. Verma"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@company.com"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ff7a1a] bg-white font-medium"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} {d.code ? `(${d.code})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reporting Manager</label>
            <input
              type="text"
              value={formData.managerName}
              onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
              placeholder="e.g. Vikram Sharma"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Gross Salary ({currentTenant.currencySymbol} {currentTenant.currency})
            </label>
            <input
              type="number"
              value={formData.monthlyGross}
              onChange={(e) => setFormData({ ...formData, monthlyGross: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Statutory breakdown (Basic 50%, HRA 40%, PF/TDS 10%) will be applied automatically.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Joining Date</label>
            <input
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            Complete Onboarding & Issue Invite
          </button>
        </div>
      </form>
    </Modal>
  );
};

