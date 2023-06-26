import onChange from 'on-change';

export default (elements, state, i18n) => {
  const { input, error } = elements;

  const renderErrors = () => {
    if (state.form.error === 'ValidationError') {
      error.textContent = i18n.t('errors.invalidUrl');
    }
  };

  const handleErrors = () => {
    if (state.form.error !== '') {
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-invalid');
    }
  };

  const clearErrors = () => {
    error.textContent = '';
  };

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form.status':
        handleErrors();
        break;
      case 'form.error':
        renderErrors();
        break;
      case 'form.valid':
        clearErrors();
        break;
      default:
        break;
    }
  });

  return watchedState;
};
