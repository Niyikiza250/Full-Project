import apiClient from '@/api/client';

export interface SubscriptionResponse {
  success: boolean;
  message: string;
}

export const subscribeEmail = async (email: string): Promise<SubscriptionResponse> => {
  try {
    const { data } = await apiClient.post<SubscriptionResponse>('/subscriptions', { email });
    return data;
  } catch {
    return { success: false, message: 'Unable to reach server. Please try again later.' };
  }
};
