/* global WebImporter */
export default function parse(element, { document }) {
  // Always use the required header row
  const headerRow = ['Search (search2)'];

  // The block expects the query index URL in the second row
  const queryIndexUrl = 'https://main--helix-block-collection--adobe.hlx.live/block-collection/sample-search-data/query-index.json';

  // Extract the search input placeholder from the source html for context
  let searchPlaceholder = '';
  const input = element.querySelector('input[type="text"][placeholder]');
  if (input && input.placeholder) {
    searchPlaceholder = input.placeholder;
  }

  // Extract the radio/label text for search context options
  const labels = Array.from(element.querySelectorAll('.search-catalogue__switcher-controls label'));
  const optionsText = labels.map(label => label.textContent.trim()).filter(Boolean);

  // Compose the cell content for the second row
  // Include the query index URL, search placeholder, and search context options if available
  const cellDiv = document.createElement('div');
  cellDiv.append(queryIndexUrl);
  if (searchPlaceholder) {
    cellDiv.appendChild(document.createElement('br'));
    cellDiv.append(searchPlaceholder);
  }
  if (optionsText.length) {
    cellDiv.appendChild(document.createElement('br'));
    cellDiv.append(optionsText.join(' | '));
  }

  // Compose the table rows
  const rows = [
    headerRow,
    [cellDiv],
  ];

  // Create the block table
  const block = WebImporter.DOMUtils.createTable(rows, document);

  // Replace the original element with the new block
  element.replaceWith(block);
}
