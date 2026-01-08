import apiClient from '../config/api';

const partyService = {
  // Get all parties with pagination
  getParties: async (page = 0, size = 10, sortBy = 'createdAt') => {
    try {
      const response = await apiClient.get('/api/v1/parties', {
        params: { page, size, sortBy }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch parties');
    }
  },

  // Create new party
  createParty: async (partyName, thumbnailFile) => {
    try {
      const formData = new FormData();
      formData.append('partyName', partyName);
      formData.append('thumbnailMultipartFile', thumbnailFile);

      const response = await apiClient.post('/api/v1/parties', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to create party');
    }
  },

  // Join party
  joinParty: async (partyId) => {
    try {
      const response = await apiClient.patch('/api/v1/parties/join', { partyId });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to join party');
    }
  },

  // Get party details
  getPartyDetails: async (partyId) => {
    try {
      const response = await apiClient.get(`/api/v1/parties/${partyId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to get party details');
    }
  },

  // Get party messages
  getPartyMessages: async (partyId, page = 0, size = 50) => {
    try {
      const response = await apiClient.get(`/api/v1/parties/${partyId}/messages`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to get messages');
    }
  },

  // Leave party
  leaveParty: async () => {
    try {
      const response = await apiClient.delete('/api/v1/parties/leave');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to leave party');
    }
  },
};

export default partyService;