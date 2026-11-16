import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant, CountryConfig, CountryCode } from '../types';
import { INITIAL_TENANTS } from '../mockData/companies';
import { COUNTRIES } from '../mockData/countries';
import { useAuth } from './AuthContext';
import { apiClient } from '../services/apiClient';
import { getTodayDateISO } from '../utils/dateUtils';

export interface ProvisionTenantInput {
  name: string;
  slug: string;
  code: string;
  countryId: CountryCode;
  planName: string;
  employeeLimit: number;
  status: 'ACTIVE' | 'TRIAL';
  adminName?: string;
  adminEmail?: string;
}

interface TenantContextType {
  currentTenant: Tenant;
  allTenants: Tenant[];
  countryConfig: CountryConfig;
  switchTenant: (tenantId: string) => void;
  formatCurrency: (amount: number) => string;
  updateTenantLimit: (tenantId: string, newLimit: number, planName?: string) => void;
  updateTenant: (tenantId: string, updates: Partial<Tenant>) => Promise<void>;
  addTenant: (tenant: Tenant) => void;
  provisionTenant: (input: ProvisionTenantInput) => Promise<Tenant>;
  adjustTenantEmployeeCount: (tenantId: string, delta: number) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const DEFAULT_TIMEZONES: Record<CountryCode, string> = {
  IN: 'Asia/Kolkata',
  AE: 'Asia/Dubai',
  UK: 'Europe/London',
  SG: 'Asia/Singapore'
};

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, baseRole, isAuthenticated, isDemoMode, token } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [currentTenantId, setCurrentTenantId] = useState<string>('tenant-bluestone-in');

  // Hydrate tenant(s) from backend when authenticated with a live JWT
  useEffect(() => {
    if (!isAuthenticated || isDemoMode || !token) return;
    let cancelled = false;

    const mapCompanyToTenant = (c: any): Tenant => {
      const countryCode = (c.country?.countryCode || 'IN') as CountryCode;
      const countryMeta = COUNTRIES[countryCode] || COUNTRIES.IN;
      const latestSub = c.subscriptions?.[0];
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        code: c.code,
        countryId: countryCode,
        currency: c.currency || countryMeta.currency,
        currencySymbol: countryMeta.currencySymbol,
        timezone: c.timezone || DEFAULT_TIMEZONES[countryCode],
        logoUrl: c.logoUrl || undefined,
        status: c.status || 'ACTIVE',
        employeeCount: c._count?.employees ?? 0,
        employeeLimit: latestSub?.plan?.employeeLimit ?? 150,
        planName: latestSub?.plan?.name || 'Growth Plan',
        createdAt: String(c.createdAt || getTodayDateISO()).slice(0, 10)
      };
    };

    const loadTenants = async () => {
      try {
        if (baseRole === 'SUPER_ADMIN') {
          const res = await apiClient.companies.list();
          if (!cancelled && res?.success && Array.isArray(res.data) && res.data.length > 0) {
            const mapped = res.data.map(mapCompanyToTenant);
            setTenants(mapped);
            setCurrentTenantId(mapped[0].id);
          }
        } else if (currentUser?.tenantId) {
          const res = await apiClient.companies.getById(currentUser.tenantId);
          if (!cancelled && res?.success && res.data) {
            const mappedTenant = mapCompanyToTenant(res.data);
            setTenants((prev) => [mappedTenant, ...prev.filter((t) => t.id !== mappedTenant.id)]);
            setCurrentTenantId(mappedTenant.id);
          }
        }
      } catch {
        // Fallback to initial tenants
      }
    };

    loadTenants();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isDemoMode, token, baseRole, currentUser?.tenantId]);

  // Keep active tenant aligned with authenticated user's tenant in live mode
  useEffect(() => {
    if (!isDemoMode && baseRole !== 'SUPER_ADMIN' && currentUser?.tenantId) {
      const matched = tenants.find((t) => t.id === currentUser.tenantId);
      if (matched) {
        setCurrentTenantId(matched.id);
      }
    }
  }, [currentUser?.tenantId, baseRole, isDemoMode, tenants]);

  const currentTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0];
  const countryConfig = COUNTRIES[currentTenant.countryId] || COUNTRIES.IN;

  const switchTenant = (tenantId: string) => {
    if (baseRole !== 'SUPER_ADMIN' && !isDemoMode) return;
    setCurrentTenantId(tenantId);
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('hrms_auth_session');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.isDemoMode || baseRole === 'SUPER_ADMIN') {
            parsed.tenantId = tenantId;
            localStorage.setItem('hrms_auth_session', JSON.stringify(parsed));
          }
        } catch {
          // ignore
        }
      }
    }
  };

  const updateTenantLimit = (tenantId: string, newLimit: number, planName?: string) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === tenantId
          ? { ...t, employeeLimit: newLimit, ...(planName ? { planName } : {}) }
          : t
      )
    );
  };

  const updateTenant = async (tenantId: string, updates: Partial<Tenant>) => {
    if (!isDemoMode && token && baseRole === 'SUPER_ADMIN') {
      try {
        await apiClient.companies.update(tenantId, {
          name: updates.name,
          status: updates.status,
          timezone: updates.timezone
        });
      } catch {
        // Resilient fallback
      }
    }

    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, ...updates } : t))
    );
  };

  const addTenant = (tenant: Tenant) => {
    setTenants((prev) => [tenant, ...prev]);
  };

  const provisionTenant = async (input: ProvisionTenantInput): Promise<Tenant> => {
    const country = COUNTRIES[input.countryId] || COUNTRIES.IN;
    let createdId = `tenant-${input.slug}-${Date.now().toString().slice(-3)}`;

    if (!isDemoMode && token && baseRole === 'SUPER_ADMIN') {
      try {
        const res = await apiClient.companies.create({
          name: input.name,
          slug: input.slug,
          code: input.code,
          countryCode: input.countryId,
          currency: country.currency,
          timezone: DEFAULT_TIMEZONES[input.countryId],
          status: input.status,
          planName: input.planName,
          adminName: input.adminName,
          adminEmail: input.adminEmail
        });
        if (res?.success && res.data?.company?.id) {
          createdId = res.data.company.id;
        }
      } catch {
        // Resilient fallback
      }
    }

    const newTenant: Tenant = {
      id: createdId,
      name: input.name,
      slug: input.slug,
      code: input.code,
      countryId: input.countryId,
      currency: country.currency,
      currencySymbol: country.currencySymbol,
      timezone: DEFAULT_TIMEZONES[input.countryId],
      status: input.status,
      employeeCount: 1,
      employeeLimit: input.employeeLimit,
      planName: input.planName,
      createdAt: getTodayDateISO()
    };

    setTenants((prev) => [newTenant, ...prev]);
    return newTenant;
  };

  const adjustTenantEmployeeCount = (tenantId: string, delta: number) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === tenantId
          ? { ...t, employeeCount: Math.max(0, t.employeeCount + delta) }
          : t
      )
    );
  };

  const formatCurrency = (amount: number): string => {
    const locale =
      currentTenant.countryId === 'IN'
        ? 'en-IN'
        : currentTenant.countryId === 'UK'
        ? 'en-GB'
        : 'en-US';
    return `${countryConfig.currencySymbol} ${amount.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        allTenants: tenants,
        countryConfig,
        switchTenant,
        formatCurrency,
        updateTenantLimit,
        updateTenant,
        addTenant,
        provisionTenant,
        adjustTenantEmployeeCount
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
