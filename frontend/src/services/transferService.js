import { getAuthHeaders } from '../utils/apiUtils';

const baseUrl = import.meta.env.VITE_API_URL;

export const getServingSlots = async () => {
  const response = await fetch(`${baseUrl}/api/service/slots`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch serving slots');
  return await response.json();
};

export const executeTransfer = async (data) => {
  const response = await fetch(`${baseUrl}/api/service/transfer`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Transfer failed');
  }
  return await response.json();
};

export const emptyServingSlot = async (slotId) => {
  const response = await fetch(`${baseUrl}/api/service/empty`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ slot_id: slotId }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to empty slot');
  }
  return await response.json();
};
