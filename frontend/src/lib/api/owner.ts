import { apiFetch } from './client';

export async function loginOwner(email: string, password: string) {
  return apiFetch<{ user: any; token: string }>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function getOwnerShops(token: string) {
  return apiFetch<{ shops: any[] }>('/api/owner/shops', { token });
}

export async function getOwnerBookings(shopId: string, token: string, opts: { date?: string; status?: string; from?: string; to?: string } = {}) {
  const params = new URLSearchParams();
  if (opts.date) params.set('date', opts.date);
  if (opts.status) params.set('status', opts.status);
  if (opts.from) params.set('from', opts.from);
  if (opts.to) params.set('to', opts.to);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<{ bookings: any[] }>(`/api/owner/shops/${shopId}/bookings${qs}`, { token });
}

export async function updateBookingStatus(bookingId: string, status: string, token: string) {
  return apiFetch<{ booking: any }>(`/api/owner/bookings/${bookingId}/status`, {
    method: 'PATCH',
    body: { status },
    token,
  });
}

export async function getOwnerServices(shopId: string, token: string) {
  return apiFetch<{ services: any[] }>(`/api/owner/shops/${shopId}/services`, { token });
}

export async function getOwnerStaff(shopId: string, token: string) {
  return apiFetch<{ staff: any[] }>(`/api/owner/shops/${shopId}/staff`, { token });
}
