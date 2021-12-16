import axios from 'axios';
import { showAlert } from './alert.js';

export const signup = async(email, password,firstName,lastName) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:9300/api/v1/users/signup',
            data: {
                firstName,
                lastName,
                userName,
                email,
                password,
            },
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully');
            window.setTimeout(() => {
                location.assign('/login');
            }, 1500);
        }

        console.log(res);
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};