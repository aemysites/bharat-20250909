/* global WebImporter */
export default function parse(element, { document }) {
  // Helper to get immediate children by class (more flexible: finds descendants too)
  function getSectionByClass(cls) {
    return element.querySelector(`.${cls}`);
  }

  // Helper to extract all HTML content from a section as a single cell
  function extractSectionContent(section) {
    if (!section) return '';
    // Wrap all children in a div for proper cell content
    const wrapper = document.createElement('div');
    Array.from(section.childNodes).forEach(node => wrapper.appendChild(node.cloneNode(true)));
    return wrapper.childNodes.length ? wrapper : '';
  }

  // Use querySelector to be more flexible and robust
  const contact = getSectionByClass('footer__contact');
  const follow = getSectionByClass('footer__follow');
  const primaryLinks = getSectionByClass('footer__primary-links');
  const secondaryLinks = getSectionByClass('footer__secondary-links');

  // Always include all 4 columns, even if empty, per block spec
  const col1 = extractSectionContent(contact);
  const col2 = extractSectionContent(follow);
  const col3 = extractSectionContent(primaryLinks);
  const col4 = extractSectionContent(secondaryLinks);

  const headerRow = ['Columns block (columns4)'];
  const contentRow = [col1, col2, col3, col4];
  const cells = [headerRow, contentRow];

  const block = WebImporter.DOMUtils.createTable(cells, document);
  element.replaceWith(block);
}
