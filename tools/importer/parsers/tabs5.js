/* global WebImporter */
export default function parse(element, { document }) {
  // Always use the block name as the header row
  const headerRow = ['Tabs (tabs5)'];
  const rows = [headerRow];

  // Get tab label from header
  const header = element.querySelector('.lcs_header');
  let tabLabel = '';
  if (header) {
    const labelEl = header.querySelector('a');
    tabLabel = labelEl ? labelEl.textContent.trim() : header.textContent.trim();
  }

  // Always provide two columns: label and content (even if content is empty)
  if (tabLabel) {
    rows.push([tabLabel, '']); // Always two columns for tab row
  }

  // Create table and replace element
  const block = WebImporter.DOMUtils.createTable(rows, document);
  element.replaceWith(block);
}
