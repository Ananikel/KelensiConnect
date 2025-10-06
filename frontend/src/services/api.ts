import type { AllDataResponse, Member } from './types';

// Utilisation d'un chemin relatif pour que le proxy Nginx en production fonctionne
const API_BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erreur de communication avec le serveur' }));
    throw new Error(errorData.message || `Erreur ${response.status}`);
  }
  if (response.status === 204) { // No Content
    return null as T;
  }
  return response.json();
}

export const api = {
    // Fetch all initial data
    // FIX: Typed the return value of getAllData to ensure consuming components know the data shape.
    getAllData: async (): Promise<AllDataResponse> => {
        return request('/all-data');
    },

    // Members
    // FIX: Typed the parameters and return value for addMember.
    addMember: async (memberData: Omit<Member, 'id'>): Promise<Member> => {
        return request('/members', {
            method: 'POST',
            body: JSON.stringify(memberData),
        });
    },
    // FIX: Typed the parameters and return value for updateMember.
    updateMember: async (memberData: Member): Promise<Member> => {
        return request(`/members/${memberData.id}`, {
            method: 'PUT',
            body: JSON.stringify(memberData),
        });
    },
    // FIX: Typed the return value for deleteMember.
    deleteMember: async (memberId: number): Promise<null> => {
        return request(`/members/${memberId}`, {
            method: 'DELETE',
        });
    },

    // Add other API functions for other modules (Finances, Events, etc.) here...
};