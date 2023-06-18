import onChange from 'on-change';

export default (elements, state) => {
  const { input, errors } = elements;

  const renderErrors = () => {
    state.form.errors.forEach((error) => {
      errors.textContent += error;
    });
  };

  const handleErrors = () => {
    if (state.form.errors.length) {
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-invalid');
    }
  };

  const clearErrors = () => {
    errors.textContent = '';
  };

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form.status':
        handleErrors();
        break;
      case 'form.errors':
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
