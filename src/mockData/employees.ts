import { Employee } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    tenantId: 'tenant-bluestone-in',
    employeeCode: 'BLU-001',
    firstName: 'Vikram',
    lastName: 'Sharma',
    email: 'vikram.sharma@bluestone.com',
    phone: '+91 98765 43210',
    department: 'Engineering',
    designation: 'VP of Technology',
    joiningDate: '2024-03-15',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    country: 'IN',
    currency: 'INR',
    salary: {
      monthlyGross: 240000,
      basic: 120000,
      allowances: 96000,
      deductions: 24000,
      netPay: 216000
    },
    bankDetails: {
      accountNumber: '**** **** 8923',
      bankName: 'HDFC Bank',
      ifscOrIban: 'HDFC0001234',
      accountHolderName: 'Vikram Sharma'
    },
    statutoryDetails: {
      hasExistingPf: true,
      pfNumber: 'MH/BAN/0012345/000/0001001',
      uanNumber: '100912345678',
      panNumber: 'AAAVS1234F',
      nationalId: '5421 9812 3456'
    },
    personalDetails: {
      gender: 'MALE',
      dateOfBirth: '1988-04-12',
      bloodGroup: 'O+',
      maritalStatus: 'MARRIED',
      workLocation: 'India Corporate HQ - Mumbai Tech Park',
      employmentType: 'FULL_TIME',
      emergencyContactName: 'Anjali Sharma (Spouse)',
      emergencyContactPhone: '+91 98765 00001'
    },
    documentsCount: 4
  },
  {
    id: 'emp-002',
    tenantId: 'tenant-bluestone-in',
    employeeCode: 'BLU-002',
    firstName: 'Priya',
    lastName: 'Nair',
    email: 'priya.nair@bluestone.com',
    phone: '+91 98220 11223',
    department: 'Human Resources',
    designation: 'Head of People & Culture',
    joiningDate: '2024-04-01',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    country: 'IN',
    currency: 'INR',
    salary: {
      monthlyGross: 160000,
      basic: 80000,
      allowances: 64000,
      deductions: 16000,
      netPay: 144000
    },
    bankDetails: {
      accountNumber: '**** **** 4412',
      bankName: 'ICICI Bank',
      ifscOrIban: 'ICIC0000552',
      accountHolderName: 'Priya Nair'
    },
    statutoryDetails: {
      hasExistingPf: true,
      pfNumber: 'MH/PUN/0023456/000/0002002',
      uanNumber: '100823456789',
      panNumber: 'BBVPN2345K',
      nationalId: '8912 3456 7890'
    },
    personalDetails: {
      gender: 'FEMALE',
      dateOfBirth: '1991-09-24',
      bloodGroup: 'A+',
      maritalStatus: 'MARRIED',
      workLocation: 'India Corporate HQ - Mumbai Tech Park',
      employmentType: 'FULL_TIME',
      emergencyContactName: 'Suresh Nair (Spouse)',
      emergencyContactPhone: '+91 98220 99999'
    },
    documentsCount: 3
  },
  {
    id: 'emp-003',
    tenantId: 'tenant-bluestone-in',
    employeeCode: 'BLU-003',
    firstName: 'Arjun',
    lastName: 'Mehta',
    email: 'arjun.mehta@bluestone.com',
    phone: '+91 97112 34567',
    department: 'Engineering',
    designation: 'Senior Full Stack Lead',
    managerId: 'emp-001',
    managerName: 'Vikram Sharma',
    joiningDate: '2024-06-15',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    country: 'IN',
    currency: 'INR',
    salary: {
      monthlyGross: 140000,
      basic: 70000,
      allowances: 56000,
      deductions: 14000,
      netPay: 126000
    },
    bankDetails: {
      accountNumber: '**** **** 9081',
      bankName: 'State Bank of India',
      ifscOrIban: 'SBIN0004321',
      accountHolderName: 'Arjun Mehta'
    },
    statutoryDetails: {
      hasExistingPf: true,
      pfNumber: 'MH/BAN/0012345/000/0003003',
      uanNumber: '100734567890',
      panNumber: 'CCCAM3456L',
      nationalId: '6789 0123 4567'
    },
    personalDetails: {
      gender: 'MALE',
      dateOfBirth: '1993-11-05',
      bloodGroup: 'B+',
      maritalStatus: 'SINGLE',
      workLocation: 'India Corporate HQ - Mumbai Tech Park',
      employmentType: 'FULL_TIME',
      emergencyContactName: 'Ramesh Mehta (Father)',
      emergencyContactPhone: '+91 97112 00000'
    },
    documentsCount: 5
  },
  {
    id: 'emp-004',
    tenantId: 'tenant-bluestone-in',
    employeeCode: 'BLU-004',
    firstName: 'Ananya',
    lastName: 'Iyer',
    email: 'ananya.iyer@bluestone.com',
    phone: '+91 99345 67890',
    department: 'Product',
    designation: 'Senior Product Manager',
    managerId: 'emp-001',
    managerName: 'Vikram Sharma',
    joiningDate: '2024-09-01',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    country: 'IN',
    currency: 'INR',
    salary: {
      monthlyGross: 150000,
      basic: 75000,
      allowances: 60000,
      deductions: 15000,
      netPay: 135000
    },
    bankDetails: {
      accountNumber: '**** **** 3110',
      bankName: 'Axis Bank',
      ifscOrIban: 'UTIB0001009',
      accountHolderName: 'Ananya Iyer'
    },
    statutoryDetails: {
      hasExistingPf: true,
      pfNumber: 'MH/BAN/0012345/000/0004004',
      uanNumber: '100645678901',
      panNumber: 'DDDAP4567M',
      nationalId: '3456 7890 1234'
    },
    personalDetails: {
      gender: 'FEMALE',
      dateOfBirth: '1994-02-18',
      bloodGroup: 'AB+',
      maritalStatus: 'SINGLE',
      workLocation: 'India Corporate HQ - Mumbai Tech Park',
      employmentType: 'FULL_TIME',
      emergencyContactName: 'Kavitha Iyer (Mother)',
      emergencyContactPhone: '+91 99345 11111'
    },
    documentsCount: 2
  },
  {
    id: 'emp-005',
    tenantId: 'tenant-bluestone-in',
    employeeCode: 'BLU-005',
    firstName: 'Rohan',
    lastName: 'Deshmukh',
    email: 'rohan.deshmukh@bluestone.com',
    phone: '+91 98980 54321',
    department: 'Engineering',
    designation: 'Mobile App Developer (RN)',
    managerId: 'emp-003',
    managerName: 'Arjun Mehta',
    joiningDate: '2025-01-10',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    country: 'IN',
    currency: 'INR',
    salary: {
      monthlyGross: 95000,
      basic: 47500,
      allowances: 38000,
      deductions: 9500,
      netPay: 85500
    },
    bankDetails: {
      accountNumber: '**** **** 6789',
      bankName: 'Kotak Mahindra Bank',
      ifscOrIban: 'KKBK0000123',
      accountHolderName: 'Rohan Deshmukh'
    },
    statutoryDetails: {
      hasExistingPf: true,
      pfNumber: 'MH/PUN/0034567/000/0005005',
      uanNumber: '100556789012',
      panNumber: 'EEERD5678N',
      nationalId: '1234 5678 9012'
    },
    personalDetails: {
      gender: 'MALE',
      dateOfBirth: '1997-07-14',
      bloodGroup: 'B+',
      maritalStatus: 'SINGLE',
      workLocation: 'India Corporate HQ - Mumbai Tech Park',
      employmentType: 'FULL_TIME',
      emergencyContactName: 'Milind Deshmukh (Father)',
      emergencyContactPhone: '+91 98980 11111'
    },
    documentsCount: 3
  },
  {
    id: 'emp-006',
    tenantId: 'tenant-bluestone-in',
    employeeCode: 'BLU-006',
    firstName: 'Sunita',
    lastName: 'Rao',
    email: 'sunita.rao@bluestone.com',
    phone: '+91 91234 56789',
    department: 'Sales & Growth',
    designation: 'Account Executive',
    joiningDate: '2025-02-15',
    status: 'PROBATION',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    country: 'IN',
    currency: 'INR',
    salary: {
      monthlyGross: 75000,
      basic: 37500,
      allowances: 30000,
      deductions: 7500,
      netPay: 67500
    },
    bankDetails: {
      accountNumber: '**** **** 1290',
      bankName: 'HDFC Bank',
      ifscOrIban: 'HDFC0004567',
      accountHolderName: 'Sunita Rao'
    },
    statutoryDetails: {
      hasExistingPf: false,
      uanNumber: '100467890123',
      panNumber: 'FFFSR6789P',
      nationalId: '2345 6789 0123'
    },
    personalDetails: {
      gender: 'FEMALE',
      dateOfBirth: '1998-10-30',
      bloodGroup: 'O-',
      maritalStatus: 'SINGLE',
      workLocation: 'India Corporate HQ - Mumbai Tech Park',
      employmentType: 'PROBATION',
      emergencyContactName: 'Radha Rao (Mother)',
      emergencyContactPhone: '+91 91234 00000'
    },
    documentsCount: 2
  },
  // UAE Employees
  {
    id: 'emp-007',
    tenantId: 'tenant-bluestone-uae',
    employeeCode: 'DXB-001',
    firstName: 'Tariq',
    lastName: 'Al-Mansoor',
    email: 'tariq.mansoor@bluestone.ae',
    phone: '+971 50 123 4567',
    department: 'Management',
    designation: 'Regional Managing Director',
    joiningDate: '2024-01-10',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    country: 'AE',
    currency: 'AED',
    salary: {
      monthlyGross: 28000,
      basic: 16800,
      allowances: 11200,
      deductions: 500,
      netPay: 27500
    },
    bankDetails: {
      accountNumber: '**** **** 9912',
      bankName: 'Emirates NBD',
      ifscOrIban: 'AE290260001234567890123',
      accountHolderName: 'Tariq Al-Mansoor'
    },
    statutoryDetails: {
      hasExistingPf: false,
      nationalId: '784-1985-1234567-1'
    },
    personalDetails: {
      gender: 'MALE',
      dateOfBirth: '1985-03-12',
      bloodGroup: 'A+',
      maritalStatus: 'MARRIED',
      workLocation: 'Middle East LLC - Dubai Internet City',
      employmentType: 'FULL_TIME',
      emergencyContactName: 'Fatima Al-Mansoor (Spouse)',
      emergencyContactPhone: '+971 50 999 8888'
    },
    documentsCount: 4
  },
  // UK Employees
  {
    id: 'emp-008',
    tenantId: 'tenant-fintech-uk',
    employeeCode: 'FTG-001',
    firstName: 'Oliver',
    lastName: 'Smith',
    email: 'oliver.smith@fintechglobal.co.uk',
    phone: '+44 20 7946 0912',
    department: 'Engineering',
    designation: 'Principal Solutions Architect',
    joiningDate: '2024-05-01',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    country: 'UK',
    currency: 'GBP',
    salary: {
      monthlyGross: 6500,
      basic: 6500,
      allowances: 0,
      deductions: 1720,
      netPay: 4780
    },
    bankDetails: {
      accountNumber: '**** 4432',
      bankName: 'Barclays Bank UK',
      ifscOrIban: 'GB29BARC20000012345678',
      accountHolderName: 'Oliver Smith'
    },
    statutoryDetails: {
      hasExistingPf: false,
      nationalId: 'QQ 12 34 56 A'
    },
    personalDetails: {
      gender: 'MALE',
      dateOfBirth: '1989-12-08',
      bloodGroup: 'O+',
      maritalStatus: 'MARRIED',
      workLocation: 'European Solutions Ltd - London Canary Wharf',
      employmentType: 'FULL_TIME',
      emergencyContactName: 'Emma Smith (Spouse)',
      emergencyContactPhone: '+44 20 7946 0001'
    },
    documentsCount: 3
  }
];
