/* global WebImporter */
export default function parse(element, { document }) {
  // Always use the target block name as the header row
  const headerRow = ['Tabs (tabs5)'];
  const rows = [headerRow];

  // Extract tab label from the .lcs_header a element
  let tabLabel = '';
  const headerDiv = element.querySelector('.lcs_header');
  if (headerDiv) {
    const tabBtn = headerDiv.querySelector('a');
    if (tabBtn && tabBtn.textContent) {
      tabLabel = tabBtn.textContent.trim();
    }
  }

  // Extract tab content: in this HTML, there is no visible tab content, but per requirements, both columns are mandatory
  // If there is no content, use a non-breaking space to avoid an unnecessary empty column
  if (tabLabel) {
    rows.push([tabLabel, '\u00A0']);
  }

  // Create and replace
  const table = WebImporter.DOMUtils.createTable(rows, document);
  element.replaceWith(table);
}
