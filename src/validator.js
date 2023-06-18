import { object, string } from 'yup';
import watch from './view.js';

const schema = object().shape({
  url: string().url().nullable(),
});

export default () => {
  const initialState = {
    form: {
      status: null,
      valid: false,
      errors: [],
    },
  };

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    errors: document.querySelector('.feedback'),
  };

  const watchedState = watch(elements, initialState);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    schema.validate({ url: elements.input.value })
      .then(() => {
        watchedState.form.valid = true;
        watchedState.form.errors = [];
        watchedState.form.status = 'valid';
      })
      .catch((error) => {
        watchedState.form.valid = false;
        if (!initialState.form.errors.includes(error.message)) {
          watchedState.form.errors.push(error.message);
        }
        watchedState.form.status = 'error';
      });
  });
};
