import { apiFetch } from './client';

export interface Staff {
  id: string;
  name: string;
  bio: string;
  photo_url: string;
  sort_order: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration_min: number;
  price_cents: number;
  deposit_cents: number;
  category: string;
  sort_order: number;
}

export interface Shop {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  logo_url: string | null;
  colors: { primary: string; accent: string; background: string };
  fonts: { heading: string; body: string };
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export interface ShopData {
  shop: Shop;
  staff: Staff[];
  services: Service[];
  staffServices: { staff_id: string; service_id: string }[];
}

export async function getShop(slug: string): Promise<ShopData> {
  return apiFetch(`/api/shops/${slug}`);
}

export async function getSlots(slug: string, staffId: string, date: string, serviceId: string): Promise<{ slots: string[] }> {
  return apiFetch(`/api/shops/${slug}/staff/${staffId}/slots?date=${date}&serviceId=${serviceId}`);
}

export async function createBooking(slug: string, body: {
  staffId: string;
  serviceId: string;
  startsAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
}) {
  return apiFetch(`/api/shops/${slug}/bookings`, { method: 'POST', body });
}
