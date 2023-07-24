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
      valid: false,
      feedback: '',
      feeds: [],
      posts: [],
      displayedPost: {},
      visitedPostsId: new Set(),
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
    posts: document.querySelector('.posts'),
    modalTitle: document.querySelector('.modal-title'),
    modalDescription: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.modal-footer a'),
  };

  const watchedState = watch(elements, initialState, i18n);

  const makeSchema = (links) => object().shape({
    url: string().url().trim().nullable()
      .notOneOf(links),
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
      })
      .catch((e) => {
        console.log(`Failed to load RSS. Code error: ${e.key}`);
      }));
    Promise.all(promises)
      .finally(() => {
        setTimeout(() => updatePosts(), 5000);
      });
  };

  const handleData = (data, url) => {
    const { feed, posts } = data;
    feed.id = uniqueId();
    feed.link = url;
    watchedState.form.feeds.push(feed);
    const newPosts = addPostsId(posts, feed.id);
    watchedState.form.posts.push(...newPosts);
  };

  const handleError = (error) => {
    if (error.isParsingError) {
      return 'notRss';
    }
    if (axios.isAxiosError(error)) {
      return 'networkError';
    }
    return error.message.key ?? 'unknown';
  };

  elements.form.addEventListener('submit', (e) => {
    const data = new FormData(elements.form);
    const newUrl = Object.fromEntries(data);
    e.preventDefault();
    const links = initialState.form.feeds.map((feed) => feed.link);
    const schema = makeSchema(links);
    schema.validate(newUrl, { abortEarly: false })
      .then(() => {
        watchedState.form.valid = true;
        const inputValue = elements.input.value;
        axios.get((addProxy(inputValue)))
          .then((response) => {
            const url = data.get('url');
            const dataParser = parser(response.data.contents);
            handleData(dataParser, url);
            watchedState.form.feedback = 'success';
          })
          .catch((err) => {
            watchedState.form.feedback = handleError(err);
          });
      })
      .catch((err) => {
        watchedState.form.valid = false;
        watchedState.form.feedback = handleError(err);
      });
  });

  elements.posts.addEventListener('click', (e) => {
    const postId = e.target.dataset.id;
    if (postId) {
      const post = watchedState.form.posts.filter((item) => item.id === postId);
      watchedState.form.displayedPost = post;
      watchedState.form.visitedPostsId.add(postId);
    }
  });

  updatePosts();
};
