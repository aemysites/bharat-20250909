/* global WebImporter */
export default function parse(element, { document }) {
  // Always use the target block name as the header
  const headerRow = ['Search (search2)'];

  // The required query index URL for this search block (static per block spec)
  const queryIndexUrl = 'https://main--helix-block-collection--adobe.hlx.live/block-collection/sample-search-data/query-index.json';

  // Create a link element for the query index
  const link = document.createElement('a');
  link.href = queryIndexUrl;
  link.textContent = queryIndexUrl;

  // The table structure: 1col x 2rows (second row ONLY contains the url link)
  const rows = [
    headerRow,
    [link],
  ];

  const table = WebImporter.DOMUtils.createTable(rows, document);
  element.replaceWith(table);
}
