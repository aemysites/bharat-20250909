/* global WebImporter */
export default function parse(element, { document }) {
  // Helper to get direct children by class
  function getChildByClass(parent, className) {
    return Array.from(parent.children).find((el) => el.classList.contains(className));
  }

  // Get all main footer sections
  const wrapper = getChildByClass(element, 'footer__wrapper');
  if (!wrapper) return;

  const contact = getChildByClass(wrapper, 'footer__contact');
  const follow = getChildByClass(wrapper, 'footer__follow');
  const primaryLinks = getChildByClass(wrapper, 'footer__primary-links');
  const secondaryLinks = getChildByClass(wrapper, 'footer__secondary-links');

  // Defensive: If any are missing, replace with empty div
  const col1 = contact || document.createElement('div');
  const col2 = follow || document.createElement('div');
  const col3 = primaryLinks || document.createElement('div');
  const col4 = secondaryLinks || document.createElement('div');

  // Build table rows
  const headerRow = ['Columns block (columns4)'];
  const columnsRow = [col1, col2, col3, col4];

  const table = WebImporter.DOMUtils.createTable([
    headerRow,
    columnsRow,
  ], document);

  element.replaceWith(table);
}
