import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { showAlert } from './alert.js';

const stripe = loadStripe(
  'pk_test_51JmZ8aG0xyz1wvCDS67eHlrUhaJ7us5mCleQW1C2uotLflfmGHsEwKVUO3Fj3ojV2c0TuuTToYCIYUX2tXleVUmo00h6kM17Za'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:9300/api/v1/bookings/checkout-session/${tourId}`
    );
    // console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
