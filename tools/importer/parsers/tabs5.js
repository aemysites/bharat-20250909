/* global WebImporter */
export default function parse(element, { document }) {
  // Find the tab label from the header
  const header = element.querySelector('.lcs_header');
  if (!header) return;
  const tabButton = header.querySelector('a');
  const tabLabel = tabButton ? tabButton.textContent.trim() : 'Tab';

  // Find all visible tab content (excluding overlays, loaders, header)
  let tabContent = '';
  Array.from(element.children).forEach(node => {
    if (
      !node.classList.contains('lcs_header') &&
      !node.classList.contains('tab_overlay') &&
      !node.classList.contains('lcs_load')
    ) {
      // Add text content even if empty (to ensure at least an empty string)
      tabContent += node.textContent;
    }
  });
  tabContent = tabContent.trim();
  // Always output a 2-column row, even if tabContent is empty
  const headerRow = ['Tabs (tabs5)'];
  const rows = [headerRow, [tabLabel, tabContent]];
  const table = WebImporter.DOMUtils.createTable(rows, document);
  element.replaceWith(table);
}
