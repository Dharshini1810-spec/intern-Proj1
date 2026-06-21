import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // Crucial for persisting session_id cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export const storyService = {
  createStory: async (theme, character) => {
    const response = await client.post('/stories/create', { theme, character });
    return response.data;
  },

  getJobStatus: async (jobId) => {
    const response = await client.get(`/jobs/${jobId}`);
    return response.data;
  },

  getStory: async (storyId) => {
    const response = await client.get(`/stories/${storyId}/complete`);
    return response.data;
  },
};
export default storyService;
