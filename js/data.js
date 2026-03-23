/**
 * Saffron & Sage - API Data Layer
 * Handles fetching and updating data from the Node.js SQLite backend.
 */

const API_BASE = 'http://localhost:5001/api';

// Helper for authenticated headers (JWT Bearer Token)
const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// --- Menu Functions ---

export const getMenu = async () => {
    try {
        const response = await fetch(`${API_BASE}/menu`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (err) {
        console.error('Failed to fetch menu:', err);
        return [];
    }
};

export const updateMenuItem = async (id, newData) => {
    try {
        const response = await fetch(`${API_BASE}/menu/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(newData)
        });
        if (!response.ok) throw new Error('Failed to update menu item');
        return true;
    } catch (err) {
        console.error('Failed to update menu:', err);
        return false;
    }
};

// --- Feedback Functions ---

export const getFeedback = async () => {
    try {
        const response = await fetch(`${API_BASE}/feedback`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (err) {
        console.error('Failed to fetch feedback:', err);
        return [];
    }
};

export const saveFeedback = async (feedback) => {
    try {
        const response = await fetch(`${API_BASE}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedback)
        });
        if (!response.ok) throw new Error('Failed to save feedback');
        return true;
    } catch (err) {
        console.error('Failed to save feedback:', err);
        return false;
    }
};

// --- Orders Functions ---

export const getOrders = async () => {
    try {
        const response = await fetch(`${API_BASE}/orders`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (err) {
        console.error('Failed to fetch orders:', err);
        return [];
    }
};

// --- Contacts Functions ---

export const getContacts = async () => {
    try {
        const response = await fetch(`${API_BASE}/contacts`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (err) {
        console.error('Failed to fetch contacts:', err);
        return [];
    }
};

export const saveContact = async (contactData) => {
    try {
        const response = await fetch(`${API_BASE}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData)
        });
        if (!response.ok) throw new Error('Failed to save contact');
        return true;
    } catch (err) {
        console.error('Failed to save contact:', err);
        return false;
    }
};

// --- Users Functions ---

export const getUsers = async () => {
    try {
        const response = await fetch(`${API_BASE}/users`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (err) {
        console.error('Failed to fetch users:', err);
        return [];
    }
};

export const changePassword = async (passwordData) => {
    try {
        const response = await fetch(`${API_BASE}/users/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(passwordData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to change password');
        return { success: true, message: data.message };
    } catch (err) {
        console.error('Failed to change password:', err);
        return { success: false, error: err.message };
    }
};
