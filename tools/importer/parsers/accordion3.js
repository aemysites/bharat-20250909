/* global WebImporter */
export default function parse(element, { document }) {
  // Step 1: Create Section Metadata table for parent block with <thead> and <tbody>
  const table = document.createElement('table');

  // Create thead with one column
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const headerCell = document.createElement('th');
  headerCell.textContent = 'Section Metadata';
  headerRow.appendChild(headerCell);
  thead.appendChild(headerRow);

  // Create tbody with block metadata row
  const tbody = document.createElement('tbody');
  const blockRow = document.createElement('tr');
  const blockCell = document.createElement('td');
  blockCell.textContent = 'block';
  const typeCell = document.createElement('td');
  typeCell.textContent = 'accordion3';
  blockRow.appendChild(blockCell);
  blockRow.appendChild(typeCell);
  tbody.appendChild(blockRow);

  table.appendChild(thead);
  table.appendChild(tbody);

  // Step 2: Create an empty content section (for child accordion item blocks)
  const contentSection = document.createElement('div');
  contentSection.className = 'parent-block-content';
  // Insert a comment to mark where child accordion blocks will be placed
  contentSection.appendChild(document.createComment('Child accordion item blocks will be inserted here'));

  // Step 3: Create section breaks (hr)
  const hrStart = document.createElement('hr');
  const hrEnd = document.createElement('hr');

  // Step 4: Replace the original element with the new section structure
  element.replaceWith(hrStart, contentSection, table, hrEnd);
}
