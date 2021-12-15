//Hide alert
export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

//SHOWING AN ALERT
export const showAlert = (type, msg) => {
  //Hide all existing alerts in the beggining
  hideAlert();
  const markup = `<div class='alert alert--${type}'>${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};
