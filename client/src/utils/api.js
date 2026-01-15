import axios from 'axios';

const api = axios.create({
    baseURL: (import.meta.env.VITE_SERVER_URL || 'http://localhost:5000') + '/api',
});

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ===================
// API Helper Functions
// ===================

// Settings API
export const getApiKeys = () => api.get('/settings/keys');
export const saveApiKey = (service, key) => api.post('/settings/keys', { service, key });
export const regenerateKey = (service) => api.post('/settings/keys/regenerate', { service });
export const getUsageStats = () => api.get('/settings/usage');
export const getProfile = () => api.get('/settings/profile');
export const updateProfile = (data) => api.put('/settings/profile', data);
export const updateSecurity = (data) => api.put('/settings/security', data);
export const updateNotifications = (data) => api.put('/settings/notifications', data);
export const updateIntegrations = (data) => api.put('/settings/integrations', data); // { service, enabled }
export const updateBilling = (data) => api.put('/settings/billing', data);

// Scheduler API
export const getMeetings = (month, year) => api.get('/scheduler/meetings', { params: { month, year } });
export const createMeeting = (data) => api.post('/scheduler/meetings', data);
export const updateMeeting = (id, data) => api.put(`/scheduler/meetings/${id}`, data);
export const deleteMeeting = (id) => api.delete(`/scheduler/meetings/${id}`);
export const getUpcomingMeetings = () => api.get('/scheduler/upcoming');

// Chat API
export const getConversations = () => api.get('/chat/conversations');
export const getMessages = (conversationId) => api.get(`/chat/${conversationId}/messages`);
export const sendMessage = (conversationId, text) => api.post(`/chat/${conversationId}/messages`, { text });
export const generateChatSummary = (conversationId) => api.post(`/chat/${conversationId}/ai-summary`);
export const markMessageRead = (messageId) => api.put(`/chat/messages/${messageId}/read`);

// CallHistory API
export const getCallHistory = (params) => api.get('/calls/history', { params });
export const deleteCall = (callId) => api.delete(`/calls/${callId}`);

// Admin API
export const getAdminStats = () => api.get('/admin/stats');
export const getHighRiskSessions = () => api.get('/admin/sessions');
export const getSecurityFeed = () => api.get('/admin/security-feed');
export const getAnalyticsData = (period) => api.get('/admin/analytics', { params: { period } });
export const getAdminUsers = () => api.get('/admin/users');
export const getAdminTranscriptions = () => api.get('/admin/transcriptions');

export default api;
