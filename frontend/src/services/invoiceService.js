import { getAuthHeaders } from '../utils/apiUtils';

const baseUrl = import.meta.env.VITE_API_URL;

// ─── Invoices ────────────────────────────────────────

export const getInvoices = async () => {
  const response = await fetch(`${baseUrl}/api/invoices`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch invoices');
  return await response.json();
};

export const getInvoiceById = async (id) => {
  const response = await fetch(`${baseUrl}/api/invoices/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch invoice details');
  return await response.json();
};

export const createInvoice = async (invoiceData) => {
  const isFormData = invoiceData instanceof FormData;
  const headers = getAuthHeaders();
  if (isFormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${baseUrl}/api/invoices`, {
    method: 'POST',
    headers,
    body: isFormData ? invoiceData : JSON.stringify(invoiceData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to create invoice');
  }
  return await response.json();
};

export const deleteInvoice = async (id) => {
  const response = await fetch(`${baseUrl}/api/invoices/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete invoice');
  return await response.json();
};

// ─── Suppliers ───────────────────────────────────────

export const getSuppliers = async () => {
  const response = await fetch(`${baseUrl}/api/suppliers`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch suppliers');
  return await response.json();
};

export const createSupplier = async (supplierData) => {
  const response = await fetch(`${baseUrl}/api/suppliers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(supplierData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to create supplier');
  }
  return await response.json();
};
