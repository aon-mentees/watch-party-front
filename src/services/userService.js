import apiClient from '../config/api';

const normalizeResponse = (responseData) => {
  return responseData?.data ?? responseData;
};

const userService = {
  getMe: async () => {
    const response = await apiClient.get('/api/v1/users/me');
    return normalizeResponse(response.data);
  },

  updateProfile: async ({ phoneNumber, email, fullName }) => {
    const response = await apiClient.patch('/api/v1/users', {
      phoneNumber,
      email,
      fullName,
    });
    return normalizeResponse(response.data);
  },

  updateProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePictureMultipartFile', file);

    const response = await apiClient.patch('/api/v1/users/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return normalizeResponse(response.data);
  },

  deleteAccount: async () => {
    const response = await apiClient.delete('/api/v1/users');
    return normalizeResponse(response.data);
  },
};

export default userService;
