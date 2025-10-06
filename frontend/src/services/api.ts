import type { AllDataResponse, Member, Contribution, ChatMessage } from '../types';

// L'URL de base sera redirigée par Nginx en production (Docker) ou par le serveur de dev de Vite
const API_BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur de communication avec le serveur' }));
      throw new Error(errorData.error || `Erreur ${response.status}`);
    }

    if (response.status === 204) { // No Content
      return null as T;
    }
    return response.json();
  } catch (error) {
    console.error(`API request failed: ${options.method || 'GET'} ${endpoint}`, error);
    throw error;
  }
}

export const api = {
    getAllData: (): Promise<AllDataResponse> => request('/all-data'),

    // Members
    addMember: (memberData: Omit<Member, 'id'>): Promise<Member> => request('/members', {
        method: 'POST',
        body: JSON.stringify(memberData),
    }),
    updateMember: (memberData: Member): Promise<Member> => request(`/members/${memberData.id}`, {
        method: 'PUT',
        body: JSON.stringify(memberData),
    }),
    deleteMember: (memberId: number): Promise<void> => request(`/members/${memberId}`, {
        method: 'DELETE',
    }),

    addContribution: (contributionData: Omit<Contribution, 'id' | 'memberName'>): Promise<Contribution> => request('/contributions', {
        method: 'POST',
        body: JSON.stringify(contributionData),
    }),

    // Messages
    addMessage: (messageData: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>): Promise<ChatMessage> => request('/messages', {
        method: 'POST',
        body: JSON.stringify(messageData),
    }),
};