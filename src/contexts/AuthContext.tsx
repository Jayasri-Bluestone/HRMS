import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';
import { apiClient } from '../services/apiClient';

/**
 * Hierarchical Role-Preview Matrix:
 * ONLY Super Admin holds multi-portal preview authority.
 * All other roles (Company Admin, HR Admin, Manager, Employee) are strictly
 * confined to their designated single-portal workspace.
 */
export const ALLOWED_PREVIEW_ROLES: Record<UserRole, UserRole[]> = {
  SUPER_ADMIN: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'],
  COMPANY_ADMIN: ['COMPANY_ADMIN'],
  HR_ADMIN: ['HR_ADMIN'],
  MANAGER: ['MANAGER'],
  EMPLOYEE: ['EMPLOYEE']
};

interface StoredSession {
  userId: string;
  email: string;
  role: UserRole;
  baseRole?: UserRole;
  tenantId: string;
  token?: string;
  refreshToken?: string;
  isDemoMode?: boolean;
  user?: User;
  baseUser?: User;
}

interface AuthContextType {
  currentUser: User;
  currentRole: UserRole;
  baseUser: User;
  baseRole: UserRole;
  allowedRoles: UserRole[];
  isPreviewingRole: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  token: string | null;
  login: (email: string, password?: string, roleOverride?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  exitRolePreview: () => void;
}

const SESSION_KEY = 'hrms_auth_session';

export const DEMO_CREDENTIALS: Record<UserRole, { email: string; name: string; title: string }> = {
  SUPER_ADMIN: {
    email: 'superadmin@hrmssaas.com',
    name: 'Platform Super Admin',
    title: 'SaaS Platform Director'
  },
  COMPANY_ADMIN: {
    email: 'ceo@bluestone.com',
    name: 'Aditya Birla',
    title: 'Managing Director & CEO'
  },
  HR_ADMIN: {
    email: 'priya.nair@bluestone.com',
    name: 'Priya Nair',
    title: 'Head of People & Culture'
  },
  MANAGER: {
    email: 'arjun.mehta@bluestone.com',
    name: 'Arjun Mehta',
    title: 'Senior Engineering Lead'
  },
  EMPLOYEE: {
    email: 'rohan.deshmukh@bluestone.com',
    name: 'Rohan Deshmukh',
    title: 'Mobile App Developer'
  }
};

const DEFAULT_USERS: Record<UserRole, User> = {
  SUPER_ADMIN: {
    id: 'user-super',
    tenantId: 'platform',
    email: 'superadmin@hrmssaas.com',
    name: 'Platform Super Admin',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
  },
  COMPANY_ADMIN: {
    id: 'user-owner',
    tenantId: 'tenant-bluestone-in',
    email: 'ceo@bluestone.com',
    name: 'Aditya Birla',
    role: 'COMPANY_ADMIN',
    designation: 'Managing Director & CEO',
    department: 'Executive',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
  },
  HR_ADMIN: {
    id: 'user-hr',
    tenantId: 'tenant-bluestone-in',
    email: 'priya.nair@bluestone.com',
    name: 'Priya Nair',
    role: 'HR_ADMIN',
    department: 'Human Resources',
    designation: 'Head of People & Culture',
    employeeId: 'emp-002',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop'
  },
  MANAGER: {
    id: 'user-mgr',
    tenantId: 'tenant-bluestone-in',
    email: 'arjun.mehta@bluestone.com',
    name: 'Arjun Mehta',
    role: 'MANAGER',
    department: 'Engineering',
    designation: 'Senior Full Stack Lead',
    employeeId: 'emp-003',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
  },
  EMPLOYEE: {
    id: 'user-emp',
    tenantId: 'tenant-bluestone-in',
    email: 'rohan.deshmukh@bluestone.com',
    name: 'Rohan Deshmukh',
    role: 'EMPLOYEE',
    department: 'Engineering',
    designation: 'Mobile App Developer (RN)',
    employeeId: 'emp-005',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
  }
};

const readStoredSession = (): StoredSession | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
};

const inferDemoRoleFromEmail = (email: string): UserRole => {
  const lower = email.toLowerCase().trim();
  if (lower.includes('rohan') || lower.includes('emp') || lower.includes('deshmukh') || lower.includes('employee')) {
    return 'EMPLOYEE';
  }
  if (lower.includes('priya') || lower.includes('hr') || lower.includes('nair')) {
    return 'HR_ADMIN';
  }
  if (lower.includes('ceo') || lower.includes('aditya') || lower.includes('birla') || lower.includes('company') || lower.includes('admin') || lower.includes('owner')) {
    return 'COMPANY_ADMIN';
  }
  if (lower.includes('arjun') || lower.includes('mgr') || lower.includes('manager') || lower.includes('mehta') || lower.includes('lead')) {
    return 'MANAGER';
  }
  if (lower.includes('super')) {
    return 'SUPER_ADMIN';
  }
  return 'EMPLOYEE';
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const savedSession = readStoredSession();
  const initialBaseRole: UserRole = savedSession?.baseRole || savedSession?.role || 'HR_ADMIN';
  const initialRole: UserRole = ALLOWED_PREVIEW_ROLES[initialBaseRole].includes(
    savedSession?.role || initialBaseRole
  )
    ? savedSession?.role || initialBaseRole
    : initialBaseRole;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!savedSession);
  const [baseRole, setBaseRole] = useState<UserRole>(initialBaseRole);
  const [baseUser, setBaseUser] = useState<User>(
    savedSession?.baseUser || savedSession?.user || DEFAULT_USERS[initialBaseRole]
  );
  const [currentRole, setCurrentRole] = useState<UserRole>(initialRole);
  const [currentUser, setCurrentUser] = useState<User>(
    savedSession?.user || DEFAULT_USERS[initialRole]
  );
  const [token, setToken] = useState<string | null>(savedSession?.token || null);
  const [refreshToken, setRefreshToken] = useState<string | null>(savedSession?.refreshToken || null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(
    savedSession ? savedSession.isDemoMode ?? !savedSession.token : true
  );

  const persistSession = (session: StoredSession) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  };

  const login = async (email: string, passwordPlain?: string, roleOverride?: UserRole): Promise<boolean> => {
    if (passwordPlain) {
      try {
        const res = await apiClient.auth.login(email, passwordPlain);
        if (res?.success && res.data?.accessToken && res.data?.user) {
          const backendUser = res.data.user;
          const backendRole = (backendUser.role as UserRole) || 'EMPLOYEE';
          const fallbackDemo = DEFAULT_USERS[backendRole];
          const mappedUser: User = {
            id: backendUser.id,
            tenantId: backendUser.company?.id || fallbackDemo.tenantId,
            email: backendUser.email,
            name: backendUser.name,
            role: backendRole,
            employeeId: backendUser.employee?.id || fallbackDemo.employeeId,
            department: backendUser.employee?.department || fallbackDemo.department,
            designation: backendUser.employee?.designation || fallbackDemo.designation,
            avatar: fallbackDemo.avatar
          };

          setBaseRole(backendRole);
          setBaseUser(mappedUser);
          setCurrentRole(backendRole);
          setCurrentUser(mappedUser);
          setToken(res.data.accessToken);
          setRefreshToken(res.data.refreshToken || null);
          setIsDemoMode(false);
          setIsAuthenticated(true);

          persistSession({
            userId: mappedUser.id,
            email: mappedUser.email,
            role: backendRole,
            baseRole: backendRole,
            tenantId: mappedUser.tenantId,
            token: res.data.accessToken,
            refreshToken: res.data.refreshToken,
            isDemoMode: false,
            user: mappedUser,
            baseUser: mappedUser
          });

          if (typeof window !== 'undefined') {
            window.location.hash = 'dashboard';
          }
          return true;
        }
      } catch (err: any) {
        const msg = String(err?.message || '');
        if (msg.includes('401') || msg.toLowerCase().includes('invalid email or password')) {
          throw err;
        }
      }
    }

    // Demo / Offline Resilient Login
    const matchedRole: UserRole = roleOverride || inferDemoRoleFromEmail(email);
    const user = DEFAULT_USERS[matchedRole];

    setBaseRole(matchedRole);
    setBaseUser(user);
    setCurrentRole(matchedRole);
    setCurrentUser(user);
    setToken(null);
    setRefreshToken(null);
    setIsDemoMode(true);
    setIsAuthenticated(true);

    persistSession({
      userId: user.id,
      email: user.email,
      role: matchedRole,
      baseRole: matchedRole,
      tenantId: user.tenantId,
      isDemoMode: true,
      user,
      baseUser: user
    });

    if (typeof window !== 'undefined') {
      window.location.hash = 'dashboard';
    }

    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setRefreshToken(null);
    setIsDemoMode(true);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
      window.location.hash = 'login';
    }
  };

  const allowedRoles = ALLOWED_PREVIEW_ROLES[baseRole] || [baseRole];
  const isPreviewingRole = currentRole !== baseRole;

  const switchRole = (targetRole: UserRole) => {
    // Strict Portal Boundary: Only Super Admin has authority to switch/preview other roles
    if (baseRole !== 'SUPER_ADMIN' || !allowedRoles.includes(targetRole)) {
      return;
    }

    const nextUser: User =
      targetRole === baseRole
        ? baseUser
        : {
            ...DEFAULT_USERS[targetRole],
            // Non-Super Admin users remain locked to their own tenant when previewing lower roles
            tenantId: baseRole === 'SUPER_ADMIN' ? currentUser.tenantId : baseUser.tenantId,
            // Preserve own employee identity when previewing EMPLOYEE/MANAGER self-service (unless SUPER_ADMIN)
            ...(baseRole !== 'SUPER_ADMIN' && baseUser.employeeId
              ? {
                  id: baseUser.id,
                  name: baseUser.name,
                  email: baseUser.email,
                  employeeId: baseUser.employeeId,
                  department: baseUser.department,
                  designation: baseUser.designation,
                  avatar: baseUser.avatar
                }
              : {}),
            role: targetRole
          };

    setCurrentRole(targetRole);
    setCurrentUser(nextUser);

    persistSession({
      userId: nextUser.id,
      email: nextUser.email,
      role: targetRole,
      baseRole,
      tenantId: nextUser.tenantId,
      ...(token ? { token } : {}),
      ...(refreshToken ? { refreshToken } : {}),
      isDemoMode,
      user: nextUser,
      baseUser
    });
  };

  const exitRolePreview = () => {
    switchRole(baseRole);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        baseUser,
        baseRole,
        allowedRoles,
        isPreviewingRole,
        isAuthenticated,
        isDemoMode,
        token,
        login,
        logout,
        switchRole,
        exitRolePreview
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
