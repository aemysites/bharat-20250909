/* global WebImporter */
export default function parse(element, { document }) {
  // Block header row
  const headerRow = ['Search (search2)'];

  // The required absolute URL to the query index
  const queryIndexUrl = 'https://main--helix-block-collection--adobe.hlx.live/block-collection/sample-search-data/query-index.json';

  // Find the search input placeholder text from the source html (less specific selector)
  let placeholderText = '';
  const textInputs = element.querySelectorAll('input[type="text"]');
  for (const input of textInputs) {
    if (input.placeholder) {
      placeholderText = input.placeholder;
      break;
    }
  }

  // Compose the second row: query index URL and placeholder text (combined)
  let secondRowContent = queryIndexUrl;
  if (placeholderText) {
    secondRowContent += `\n${placeholderText}`;
  }

  // Table rows: header, then query index URL + placeholder text
  const rows = [
    headerRow,
    [secondRowContent],
  ];

  // Create the block table
  const block = WebImporter.DOMUtils.createTable(rows, document);

  // Replace the original element with the block table
  element.replaceWith(block);
}
