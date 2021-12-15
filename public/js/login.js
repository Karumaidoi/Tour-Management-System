import axios from 'axios';
import { showAlert } from './alert.js';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:9300/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }

    console.log(res);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logOut = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:9300/api/v1/users/logout',
    });

    if (res.data.status === 'success') location.reload(true);
  } catch (err) {
    showAlert(
      'error',
      'Errror when logging out, please try again sometime later'
    );
  }
};
