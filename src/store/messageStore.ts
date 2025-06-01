import { create } from 'zustand';
import * as messageApi from '../api/messages';
import type { Message, SendMessageData } from '../api/messages';

interface MessageState {
  conversations: Message[][];
  currentConversation: Message[] | null;
  isLoading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  fetchMessagesByUser: (userId: string) => Promise<void>;
  sendMessage: (data: SendMessageData) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  clearError: () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  isLoading: false,
  error: null,

  fetchConversations: async () => {
    try {
      set({ isLoading: true, error: null });
      const conversations = await messageApi.getConversations();
      set({ conversations, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch conversations',
        isLoading: false,
      });
    }
  },

  fetchMessagesByUser: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const messages = await messageApi.getMessagesByUser(userId);
      set({ currentConversation: messages, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch messages',
        isLoading: false,
      });
    }
  },

  sendMessage: async (data: SendMessageData) => {
    try {
      set({ isLoading: true, error: null });
      const message = await messageApi.sendMessage(data);
      
      // Update current conversation if it exists
      if (get().currentConversation) {
        set(state => ({
          currentConversation: [...(state.currentConversation || []), message],
        }));
      }
      
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to send message',
        isLoading: false,
      });
      throw error;
    }
  },

  markMessageAsRead: async (messageId: string) => {
    try {
      set({ isLoading: true, error: null });
      const updatedMessage = await messageApi.markMessageAsRead(messageId);
      
      // Update message in current conversation
      if (get().currentConversation) {
        set(state => ({
          currentConversation: state.currentConversation?.map(msg =>
            msg._id === messageId ? updatedMessage : msg
          ) || null,
        }));
      }
      
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to mark message as read',
        isLoading: false,
      });
    }
  },

  deleteMessage: async (messageId: string) => {
    try {
      set({ isLoading: true, error: null });
      await messageApi.deleteMessage(messageId);
      
      // Remove message from current conversation
      if (get().currentConversation) {
        set(state => ({
          currentConversation: state.currentConversation?.filter(
            msg => msg._id !== messageId
          ) || null,
        }));
      }
      
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to delete message',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useMessageStore; 