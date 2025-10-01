/* global WebImporter */
export default function parse(element, { document }) {
  // Step 1: Create Section Metadata Table with thead/tbody
  const table = document.createElement('table');

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const headerCell = document.createElement('th');
  headerCell.textContent = 'Section Metadata';
  headerRow.appendChild(headerCell);
  thead.appendChild(headerRow);

  const tbody = document.createElement('tbody');
  const bodyRow = document.createElement('tr');
  const blockCell = document.createElement('td');
  blockCell.textContent = 'block';
  const valueCell = document.createElement('td');
  valueCell.textContent = 'accordion7';
  bodyRow.appendChild(blockCell);
  bodyRow.appendChild(valueCell);
  tbody.appendChild(bodyRow);

  table.appendChild(thead);
  table.appendChild(tbody);

  // Step 2: Create Content Section Div (container for child blocks)
  const contentSection = document.createElement('div');
  contentSection.className = 'parent-block-content';
  contentSection.appendChild(document.createComment(' Child blocks will be inserted here during import '));

  // Step 3: Create Section Breaks
  const hrStart = document.createElement('hr');
  const hrEnd = document.createElement('hr');

  // Step 4: Replace Original Element with the New Structure
  element.replaceWith(hrStart, contentSection, table, hrEnd);
}
