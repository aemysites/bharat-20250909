/* global WebImporter */
export default function parse(element, { document }) {
  // Helper to get immediate children by class
  const getChildByClass = (parent, className) =>
    Array.from(parent.children).find((child) => child.classList.contains(className));

  // Get main wrappers
  const wrapper = element.querySelector('.footer__wrapper') || element;

  // Get columns: contact, follow, primary, secondary
  const contact = getChildByClass(wrapper, 'footer__contact');
  const follow = getChildByClass(wrapper, 'footer__follow');
  const primaryLinks = getChildByClass(wrapper, 'footer__primary-links');
  const secondaryLinks = getChildByClass(wrapper, 'footer__secondary-links');

  // Defensive: if follow is present, split further
  let followSocial, followConnect;
  if (follow) {
    followSocial = getChildByClass(follow, 'footer__follow-social');
    followConnect = getChildByClass(follow, 'footer__follow-connect');
  }

  // 4 columns: contact, social, connect(app), primary links
  // We'll combine social/connect into one column for balance if needed

  // Compose content for each column
  const col1 = contact ? contact : document.createElement('div');

  // Social and connect as one column (both parts of 'follow')
  let col2;
  if (followSocial || followConnect) {
    col2 = document.createElement('div');
    if (followSocial) col2.appendChild(followSocial);
    if (followConnect) col2.appendChild(followConnect);
  } else {
    col2 = document.createElement('div');
  }

  const col3 = primaryLinks ? primaryLinks : document.createElement('div');
  const col4 = secondaryLinks ? secondaryLinks : document.createElement('div');

  // Compose table rows
  const headerRow = ['Columns block (columns4)'];
  const contentRow = [col1, col2, col3, col4];

  // Build table
  const table = WebImporter.DOMUtils.createTable([
    headerRow,
    contentRow,
  ], document);

  // Replace original element
  element.replaceWith(table);
}
