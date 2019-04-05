const axios = require('axios');

const AUTH_API_ROOT = process.env.AUTH_API_ROOT || `https://${window.location.hostname}/auth/api`;

export const getLogin = () => (
  new Promise(async (resolve) => {
    try {
      const token = window.localStorage.getItem('accessToken');
      await axios.get(`${AUTH_API_ROOT}/login`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      resolve(true);
    } catch (error) {
      resolve(null);
    }
  })
);

export default {
  getLogin,
}
