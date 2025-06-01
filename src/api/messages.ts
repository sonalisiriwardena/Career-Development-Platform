import { apiClient } from './client';

export interface Message {
  _id: string;
  content: string;
  senderId: string;
  receiverId: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  receiver?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface SendMessageData {
  receiverId: string;
  content: string;
}

export const getConversations = async (): Promise<Message[][]> => {
  const response = await apiClient.get('/messages/conversations');
  return response.data;
};

export const getMessagesByUser = async (userId: string): Promise<Message[]> => {
  const response = await apiClient.get(`/messages/user/${userId}`);
  return response.data;
};

export const sendMessage = async (data: SendMessageData): Promise<Message> => {
  const response = await apiClient.post('/messages', data);
  return response.data;
};

export const markMessageAsRead = async (messageId: string): Promise<Message> => {
  const response = await apiClient.patch(`/messages/${messageId}/read`);
  return response.data;
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  await apiClient.delete(`/messages/${messageId}`);
}; 