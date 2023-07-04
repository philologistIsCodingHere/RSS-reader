import { object, string, setLocale } from 'yup';
import { uniqueId } from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import watch from './view.js';
import parser from './parser.js';
import resources from './locales/index.js';

export default () => {
  const defaultLang = 'ru';

  const initialState = {
    form: {
      status: null,
      valid: false,
      error: '',
      feeds: [],
      posts: [],
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

  const addId = (posts) => posts.map((post) => {
    const newPost = post;
    newPost.id = uniqueId();
    return newPost;
  });

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    error: document.querySelector('.feedback'),
  };

  const watchedState = watch(elements, initialState, i18n);

  const addProxy = (url) => {
    const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
    proxyUrl.searchParams.append('disableCache', 'true');
    proxyUrl.searchParams.append('url', url);
    return proxyUrl.toString();
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    schema.validate({ url: elements.input.value })
      .then(() => {
        watchedState.form.valid = true;
        watchedState.form.error = '';
        watchedState.form.status = 'valid';
        axios.get((addProxy(elements.input.value)))
          .then((response) => {
            const { feed, posts } = parser(response.data.contents);
            watchedState.form.feeds.push(feed);
            watchedState.form.posts.push(...addId(posts));
          });
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
