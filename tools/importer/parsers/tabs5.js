/* global WebImporter */
export default function parse(element, { document }) {
  // Only parse if element has the expected structure
  if (!element || !element.classList.contains('lcs_slide_out')) return;

  // Find the tab label (the header link)
  const headerLink = element.querySelector('.lcs_header > a');

  // Build the table rows
  const headerRow = ['Tabs (tabs5)'];
  const rows = [headerRow];

  if (headerLink) {
    // Always include two columns: Tab Label and Tab Content (even if empty)
    rows.push([
      headerLink.textContent.trim(), // Tab Label
      '' // Tab Content (empty, as there is none in the HTML)
    ]);
  }

  // Create the block table
  const table = WebImporter.DOMUtils.createTable(rows, document);

  // Replace the original element with the new table
  element.replaceWith(table);
}
