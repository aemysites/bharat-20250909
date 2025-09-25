/* global WebImporter */
export default function parse(element, { document }) {
  // The block must have a single header row with the block name
  const headerRow = ['Embed3 (embed3)'];

  // The only child is an iframe; get its src attribute and any available text (e.g. title)
  const iframe = element;
  let url = '';
  let title = '';
  if (iframe && iframe.tagName === 'IFRAME') {
    url = iframe.getAttribute('src') || '';
    title = iframe.getAttribute('title') || '';
  }

  // Defensive: if the url is protocol-relative or missing protocol, add https://
  if (url && url.startsWith('//')) {
    url = 'https:' + url;
  }

  // If the src is a YouTube embed, convert to watch URL
  let linkUrl = url;
  if (/youtube\.com\/embed\//.test(url)) {
    const match = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      linkUrl = `https://www.youtube.com/watch?v=${match[1]}`;
    }
  }

  // Create the link to the video
  const link = document.createElement('a');
  link.href = linkUrl;
  link.textContent = linkUrl;

  // If the iframe has a title, include it as text above the link
  let cellContent;
  if (title) {
    const titleDiv = document.createElement('div');
    titleDiv.textContent = title;
    cellContent = [titleDiv, link];
  } else {
    cellContent = [link];
  }

  const contentRow = [cellContent];
  const cells = [headerRow, contentRow];

  // Create the block table
  const table = WebImporter.DOMUtils.createTable(cells, document);

  // Replace the original element
  element.replaceWith(table);
}
