import { object, string, setLocale } from 'yup';
import i18next from 'i18next';
import watch from './view.js';
import resources from './locales/index.js';

export default () => {
  const defaultLang = 'ru';

  const initialState = {
    form: {
      status: null,
      valid: false,
      error: '',
    },
  };

  const i18n = i18next.createInstance();
  i18n
    .init({
      lng: defaultLang,
      debug: false,
      resources,
    });

  setLocale({
    mixed: {
      url: () => ({ key: 'errors.invalidUrl' }),
    },
  });

  const schema = object().shape({
    url: string().url().nullable(),
  });

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    error: document.querySelector('.feedback'),
  };

  const watchedState = watch(elements, initialState, i18n);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    schema.validate({ url: elements.input.value })
      .then(() => {
        watchedState.form.valid = true;
        watchedState.form.error = '';
        watchedState.form.status = 'valid';
      })
      .catch((err) => {
        watchedState.form.valid = false;
        if (!initialState.form.error.includes(err.name)) {
          watchedState.form.error = err.name;
        }
        watchedState.form.status = 'error';
      });
  });
};
