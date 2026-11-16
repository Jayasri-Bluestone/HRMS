/// <reference types="vite/client" />
/**
 * OmniHRMS Multi-Tenant SaaS API Client
 * Seamlessly interfaces with Node.js/Express Backend (http://localhost:5000/api/v1)
 * with graceful fallback to local data if the backend server is offline.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  private getHeaders(customHeaders: Record<string, string> = {}): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('hrms_auth_session');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed.token) {
            headers['Authorization'] = `Bearer ${parsed.token}`;
          }
          if (parsed.tenantId) {
            headers['x-tenant-id'] = parsed.tenantId;
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders(options.headers as Record<string, string>);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      console.warn(`[ApiClient] Live request to ${endpoint} failed: ${err.message}. Operating in resilient mode.`);
      throw err;
    }
  }

  // 1. Auth Services
  auth = {
    login: (email: string, passwordPlain?: string) =>
      this.request<{ success: boolean; data: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: passwordPlain }),
      }),
    refresh: (refreshToken: string) =>
      this.request<{ success: boolean; data: any }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
    me: () => this.request<{ success: boolean; data: any }>('/auth/me'),
  };

  // 2. Companies / Tenants
  companies = {
    list: () => this.request<{ success: boolean; data: any[] }>('/companies'),
    getById: (id: string) => this.request<{ success: boolean; data: any }>(`/companies/${id}`),
    create: (payload: any) =>
      this.request<{ success: boolean; data: any }>('/companies', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: { name?: string; status?: string; timezone?: string; planId?: string }) =>
      this.request<{ success: boolean; data: any }>(`/companies/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    getMetrics: () => this.request<{ success: boolean; data: any }>('/companies/platform/metrics'),
    listPlans: () => this.request<{ success: boolean; data: any[] }>('/companies/platform/plans'),
    listPayrollRules: () => this.request<{ success: boolean; data: any[] }>('/companies/platform/payroll-rules'),
    logContextSwitch: (id: string) =>
      this.request<{ success: boolean; data: any }>(`/companies/${id}/context-log`, {
        method: 'POST',
      }),
  };

  // 3. Employees
  employees = {
    list: (params?: { departmentId?: string; search?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.request<{ success: boolean; data: any[] }>(`/employees${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => this.request<{ success: boolean; data: any }>(`/employees/${id}`),
    create: (data: any) =>
      this.request<{ success: boolean; data: any }>('/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };

  // 4. Attendance
  attendance = {
    checkIn: (employeeId?: string, locationEvidence?: string) =>
      this.request<{ success: boolean; data: any }>('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify({ employeeId, locationEvidence }),
      }),
    checkOut: (employeeId?: string) =>
      this.request<{ success: boolean; data: any }>('/attendance/check-out', {
        method: 'POST',
        body: JSON.stringify({ employeeId }),
      }),
    regularize: (payload: { employeeId?: string; date: string; reason: string; remarks?: string }) =>
      this.request<{ success: boolean; data: any }>('/attendance/regularize', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    reviewRegularization: (id: string, status: 'APPROVED' | 'REJECTED', remarks?: string) =>
      this.request<{ success: boolean; data: any }>(`/attendance/${id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ status, remarks }),
      }),
    getMy: () => this.request<{ success: boolean; data: any[] }>('/attendance/my'),
    getToday: () => this.request<{ success: boolean; data: any[] }>('/attendance/today'),
  };

  // 5. Leave Management
  leave = {
    apply: (payload: {
      employeeId: string;
      leaveTypeId: string;
      startDate: string;
      endDate: string;
      reason: string;
    }) =>
      this.request<{ success: boolean; data: any }>('/leave/apply', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    review: (id: string, status: 'APPROVED' | 'REJECTED', managerComments?: string) =>
      this.request<{ success: boolean; data: any }>(`/leave/${id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ status, managerComments }),
      }),
    getBalances: (employeeId: string) =>
      this.request<{ success: boolean; data: any[] }>(`/leave/balance/${employeeId}`),
    list: (status?: string) =>
      this.request<{ success: boolean; data: any[] }>(`/leave${status ? `?status=${status}` : ''}`),
  };

  // 6. International Payroll
  payroll = {
    preview: (year?: number, month?: number) => {
      const query = new URLSearchParams({
        ...(year ? { year: year.toString() } : {}),
        ...(month ? { month: month.toString() } : {}),
      }).toString();
      return this.request<{ success: boolean; data: any }>(`/payroll/preview${query ? `?${query}` : ''}`);
    },
    run: (year: number, month: number, idempotencyKey?: string) =>
      this.request<{ success: boolean; data: any }>('/payroll/run', {
        method: 'POST',
        body: JSON.stringify({ year, month, idempotencyKey }),
      }),
    approve: (id: string) =>
      this.request<{ success: boolean; data: any }>(`/payroll/approve/${id}`, {
        method: 'PATCH',
      }),
    listRuns: () => this.request<{ success: boolean; data: any[] }>('/payroll/runs'),
  };

  // 7. Payslips
  payslips = {
    getByEmployee: (employeeId: string) =>
      this.request<{ success: boolean; data: any[] }>(`/payslips/employee/${employeeId}`),
    getById: (id: string) => this.request<{ success: boolean; data: any }>(`/payslips/${id}`),
  };

  // 8. Audit Logs
  audit = {
    list: (params?: { module?: string; action?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.request<{ success: boolean; data: any[] }>(`/audit${query ? `?${query}` : ''}`);
    },
  };
}

export const apiClient = new ApiClient();
