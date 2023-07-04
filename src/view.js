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

  const createList = (title) => {
    const card = document.createElement('div');
    const cardBody = document.createElement('div');
    const cardTitle = document.createElement('h2');
    const list = document.createElement('ul');

    card.classList.add('card', 'border-0');
    cardBody.classList.add('card-body');
    cardTitle.classList.add('card-title', 'h4');
    list.classList.add('list-group', 'border-0', 'rounded-0');
    cardTitle.textContent = i18n.t(title);

    cardBody.append(cardTitle);
    card.append(cardBody);
    card.append(list);
    return card;
  };

  const createFeed = (feed) => {
    const { title, description } = feed;
    const listItem = document.createElement('li');
    const listItemTitle = document.createElement('h3');
    const listItemParagraph = document.createElement('p');

    listItem.classList.add('list-group-item', 'border-0', 'border-end-0');
    listItemTitle.classList.add('h6', 'm-0');
    listItemParagraph.classList.add('m-0', 'small', 'text-black-50');
    listItemTitle.textContent = title;
    listItemParagraph.textContent = description;

    listItem.append(listItemTitle);
    listItem.append(listItemParagraph);

    return listItem;
  };

  const renderFeeds = (feeds) => {
    const feedsClass = document.querySelector('.feeds');
    feedsClass.append(createList('feeds'));
    const list = feedsClass.querySelector('ul');
    feeds.forEach((feed) => list.append(createFeed(feed)));
  };

  const createPost = (post) => {
    const { title, link, id } = post;
    const listItem = document.createElement('li');
    const linkItem = document.createElement('a');
    const button = document.createElement('button');

    listItem.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );
    linkItem.classList.add('fw-bold');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');

    linkItem.setAttribute('href', link);
    linkItem.setAttribute('target', '_blank');
    linkItem.setAttribute('data-id', id);
    linkItem.setAttribute('rel', 'noopener');
    linkItem.setAttribute('noreferrer', 'noreferrer');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    linkItem.textContent = title;
    button.textContent = i18n.t('view');

    listItem.append(linkItem);
    listItem.append(button);

    return listItem;
  };

  const renderPosts = (posts) => {
    const postsClass = document.querySelector('.posts');
    postsClass.append(createList('posts'));
    const list = postsClass.querySelector('ul');
    posts.forEach((post) => list.append(createPost(post)));
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
      case 'form.feeds':
        renderFeeds(state.form.feeds);
        break;
      case 'form.posts':
        renderPosts(state.form.posts);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
