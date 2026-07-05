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

// --- CRUD Supiere ---

export const createServingSlot = async (slotName) => {
  const response = await fetch(`${baseUrl}/api/service/slots`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ slot_name: slotName }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Eroare la crearea supiererei.');
  }
  return await response.json();
};

export const updateServingSlot = async (id, slotName) => {
  const response = await fetch(`${baseUrl}/api/service/slots/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ slot_name: slotName }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Eroare la actualizarea supiererei.');
  }
  return await response.json();
};

export const deleteServingSlot = async (id) => {
  const response = await fetch(`${baseUrl}/api/service/slots/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Eroare la ștergerea supiererei.');
  }
  return await response.json();
};
