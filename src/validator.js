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
      feedback: '',
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
    string: {
      url: () => ({ key: 'ValidationError' }),
      required: () => ({ key: 'isEmpty' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'notOneOf' }),
    },
  });

  const addPostsId = (posts, feedId) => {
    const newPosts = posts.map((post) => {
      const newPost = post;
      newPost.id = uniqueId();
      newPost.feedId = feedId;
      return newPost;
    });
    return newPosts;
  };

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
  };

  const watchedState = watch(elements, initialState, i18n);

  const makeSchema = (links) => object().shape({
    url: string().url().nullable().notOneOf(links),
  });

  const addProxy = (url) => {
    const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
    proxyUrl.searchParams.append('disableCache', 'true');
    proxyUrl.searchParams.append('url', url);
    return proxyUrl.toString();
  };

  const updatePosts = () => {
    const promises = watchedState.form.feeds.map((feed) => axios.get(addProxy(feed.link))
      .then((response) => {
        const { posts } = parser(response.data.contents);
        const postsFromState = watchedState.form.posts;
        const postsWithCurrentId = postsFromState.filter((post) => post.feedId === feed.id);
        const displayedPostLinks = postsWithCurrentId.map((post) => post.link);
        const newPosts = posts.filter((post) => !displayedPostLinks.includes(post.link));
        addPostsId(newPosts, feed.id);
        watchedState.form.posts.unshift(...newPosts);
      }));
    Promise.all(promises)
      .finally(() => {
        setTimeout(() => updatePosts(), 5000);
      });
  };

  const handleData = (data) => {
    const { feed, posts } = data;
    feed.id = uniqueId();
    watchedState.form.feeds.push(feed);
    const newPosts = addPostsId(posts, feed.id);
    watchedState.form.posts.push(...newPosts);
  };

  elements.form.addEventListener('submit', (e) => {
    const data = new FormData(elements.form);
    const newUser = Object.fromEntries(data);
    e.preventDefault();
    const links = initialState.form.feeds.map((feed) => feed.link);
    const schema = makeSchema(links);
    schema.validate(newUser, { abortEarly: false })
      .then(() => {
        watchedState.form.valid = true;
        watchedState.form.feedback = 'success';
        watchedState.form.status = 'valid';
        axios.get((addProxy(elements.input.value)))
          .then((response) => {
            const url = data.get('url');
            const dataParser = parser(response.data.contents, url);
            handleData(dataParser);
          });
      })
      .catch((err) => {
        watchedState.form.valid = false;
        if (!initialState.form.feedback.includes(err.message.key)) {
          watchedState.form.feedback = err.message.key;
        }
        watchedState.form.status = 'error';
      });
  });
  updatePosts();
};
