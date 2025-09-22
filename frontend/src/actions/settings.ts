'use client';
import { api } from '@/lib/api-client';

// Profile
export async function getAdminProfile() {
  const { data } = await api.get('/settings/profile');
  return data?.data ?? null;
}

export async function updateAdminProfile(values: { name?: string; email: string }) {
  const { data } = await api.put('/settings/profile', values);
  return data;
}

// Password
export async function changeAdminPassword(values: { oldPassword: string; newPassword: string }) {
  const { data } = await api.put('/settings/password', values);
  return data;
}

// General settings (per admin)
export async function getAdminGeneralSettings() {
  const { data } = await api.get('/settings/general');
  return data?.data ?? null;
}

export async function updateAdminGeneralSettings(values: Record<string, any>) {
  const { data } = await api.put('/settings/general', values);
  return data;
}


