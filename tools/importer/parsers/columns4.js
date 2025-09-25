/* global WebImporter */
export default function parse(element, { document }) {
  // Defensive: Find all immediate children of the main footer wrapper
  const wrapper = element.querySelector('.footer__wrapper');
  if (!wrapper) return;

  // Get all major sections as columns
  // 1. Contact
  const contact = wrapper.querySelector('.footer__contact');
  // 2. Follow (includes social and app)
  const follow = wrapper.querySelector('.footer__follow');
  // 3. Primary links
  const primaryLinks = wrapper.querySelector('.footer__primary-links');
  // 4. Secondary links (and copyright)
  const secondaryLinks = wrapper.querySelector('.footer__secondary-links');

  // Compose the columns row
  const columnsRow = [contact, follow, primaryLinks, secondaryLinks].filter(Boolean);

  // Table header
  const headerRow = ['Columns block (columns4)'];

  // Build the table
  const cells = [headerRow, columnsRow];
  const block = WebImporter.DOMUtils.createTable(cells, document);

  // Replace the original element
  element.replaceWith(block);
}
