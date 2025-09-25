/* global WebImporter */
export default function parse(element, { document }) {
  // Always use the block name as the header row
  const headerRow = ['Tabs (tabs5)'];
  const rows = [headerRow];

  // Find the tab label (from header)
  const headerDiv = element.querySelector('.lcs_header');
  let tabLabel = '';
  if (headerDiv) {
    const tabButton = headerDiv.querySelector('a');
    if (tabButton) {
      tabLabel = tabButton.textContent.trim();
    }
  }

  // Find tab content: use all visible text except the tab label
  let tabContent = '';
  // Exclude header and overlay
  Array.from(element.children).forEach((child) => {
    if (!child.classList.contains('lcs_header') && !child.classList.contains('tab_overlay')) {
      // Get all text content inside this child
      const text = child.textContent.trim();
      if (text && text !== tabLabel) {
        tabContent += (tabContent ? '\n' : '') + text;
      }
    }
  });

  // Only add row if tabLabel exists (tabContent may be empty)
  if (tabLabel) {
    rows.push([tabLabel, tabContent]);
  }

  // Create the table block
  const block = WebImporter.DOMUtils.createTable(rows, document);
  element.replaceWith(block);
}
