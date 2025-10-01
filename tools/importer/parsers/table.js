/* global WebImporter */
export default function parse(element, { document }) {
  // Table header must always be the block name
  const headerRow = ['Table (table)'];
  const rows = [headerRow];

  // Defensive: find thead and tbody
  const thead = element.querySelector('thead');
  const tbody = element.querySelector('tbody');

  // Extract ALL visible text from each th in thead (skip first nav column)
  let columnNames = [];
  if (thead) {
    const ths = Array.from(thead.querySelectorAll('tr > th'));
    for (let i = 0; i < ths.length; i++) {
      const th = ths[i];
      // For navigation column, include all text/buttons as-is
      if (i === 0) {
        // Clone all child nodes (e.g., buttons)
        const cellContent = [];
        Array.from(th.childNodes).forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            cellContent.push(node.cloneNode(true));
          } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            cellContent.push(node.textContent.trim());
          }
        });
        columnNames.push(cellContent.length === 1 ? cellContent[0] : cellContent);
      } else {
        // For date columns, include ALL text and markup
        const cellContent = [];
        Array.from(th.childNodes).forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            cellContent.push(node.cloneNode(true));
          } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            cellContent.push(node.textContent.trim());
          }
        });
        columnNames.push(cellContent.length === 1 ? cellContent[0] : cellContent);
      }
    }
    rows.push(columnNames);
  }

  // Extract all cell content (including markup) from tbody rows
  if (tbody) {
    const trs = Array.from(tbody.querySelectorAll('tr'));
    trs.forEach(tr => {
      const tds = Array.from(tr.querySelectorAll('td'));
      const row = [];
      tds.forEach(td => {
        // For each cell, include all elements and text (not just textContent)
        const cellContent = [];
        Array.from(td.childNodes).forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            cellContent.push(node.cloneNode(true));
          } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            cellContent.push(node.textContent.trim());
          }
        });
        row.push(cellContent.length === 1 ? cellContent[0] : cellContent);
      });
      if (row.length === columnNames.length) {
        rows.push(row);
      }
    });
  }

  // Build the block table
  const blockTable = WebImporter.DOMUtils.createTable(rows, document);

  // Replace the original element with the new block table
  element.replaceWith(blockTable);
}
