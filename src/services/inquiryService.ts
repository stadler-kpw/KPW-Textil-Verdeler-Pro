import type { ContactFormData } from '@/types';

export interface InquiryResponse {
  success: boolean;
  message: string;
  emailId?: string;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function sendInquiry(
  formData: ContactFormData,
  pdfBlob: Blob
): Promise<InquiryResponse> {
  const pdfBase64 = await blobToBase64(pdfBlob);

  const response = await fetch('/api/send-inquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...formData,
      pdfBase64,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Netzwerkfehler' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
