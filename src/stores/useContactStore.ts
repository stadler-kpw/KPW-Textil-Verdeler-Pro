import { create } from 'zustand';
import type { ContactFormData } from '@/types';

interface ContactState {
  formData: ContactFormData;
}

interface ContactActions {
  updateField: (field: keyof ContactFormData, value: string) => void;
  resetForm: () => void;
}

const initialFormData: ContactFormData = {
  company: '',
  name: '',
  email: '',
  phone: '',
  message: '',
};

export const useContactStore = create<ContactState & ContactActions>()((set) => ({
  formData: { ...initialFormData },

  updateField: (field, value) => set((state) => ({
    formData: { ...state.formData, [field]: value },
  })),

  resetForm: () => set({ formData: { ...initialFormData } }),
}));
