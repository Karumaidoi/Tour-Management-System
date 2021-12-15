import '@babel/polyfill';
import { displayMap } from './mapbox.js';
import { login, logOut } from './login.js';
import { updateSettings } from './updateUser.js';

import { bookTour } from './stripe.js';

//DOM
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateDataForm = document.querySelector('.form-user-data');
const updateUserPassword = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

//VALUES

// DELEGATION
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Alex');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.location);
  displayMap(locations);
}

if (logOutBtn) logOutBtn.addEventListener('click', logOut);

if (updateDataForm)
  updateDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    console.log(form);
    updateSettings(form, 'data');
  });

if (updateUserPassword)
  updateUserPassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn-update').innerHTML = 'updating';
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    await updateSettings(
      { currentPassword, password, confirmPassword },
      'password'
    );

    //Reset the fields
    document.querySelector('.btn-update').innerHTML = 'save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.innerHTML = 'processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
