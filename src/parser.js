export default (content) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/xml');

  const getFeed = (data) => {
    const title = data.querySelector('title').textContent;
    const description = data.querySelector('description').textContent;
    const link = data.querySelector('link').textContent;
    return { title, description, link };
  };

  const getPosts = (data) => {
    const items = data.querySelectorAll('item');
    return Array.from(items).map((item) => {
      const title = item.querySelector('title').textContent;
      const description = item.querySelector('description').textContent;
      const link = item.querySelector('link').textContent;
      return { title, description, link };
    });
  };

  const feed = getFeed(doc);
  const posts = getPosts(doc);
  return { feed, posts };
};
