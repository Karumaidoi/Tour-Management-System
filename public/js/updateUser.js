import axios from 'axios';
import { showAlert } from './alert.js';

//type represents the type of data

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:9300/api/v1/users/updatePassword'
        : 'http://127.0.0.1:9300/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Data updated successifully');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
