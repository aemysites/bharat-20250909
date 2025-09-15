/* global WebImporter */
export default function parse(element, { document }) {
  // Defensive: Find the main wrapper (should be .footer__wrapper)
  const wrapper = element.querySelector('.footer__wrapper') || element;

  // Get the four main columns in the footer
  // 1. Contact
  // 2. Follow (social + app)
  // 3. Primary links
  // 4. Secondary links
  // We'll use direct children of wrapper for robustness
  const columns = [];
  const colDivs = Array.from(wrapper.children);

  // Defensive: Only keep divs that have content
  colDivs.forEach((col) => {
    // Only include columns with at least one child
    if (col && col.children.length > 0) {
      columns.push(col);
    }
  });

  // Defensive: If we have less than 4 columns, try to find missing ones
  // (not strictly necessary for this HTML, but helps with future-proofing)
  while (columns.length < 4) {
    columns.push(document.createElement('div'));
  }

  // Table header
  const headerRow = ['Columns block (columns4)'];

  // Table content row: each column's content in a cell
  const contentRow = columns.map((col) => col);

  // Create the block table
  const cells = [headerRow, contentRow];
  const block = WebImporter.DOMUtils.createTable(cells, document);

  // Replace the original element with the block table
  element.replaceWith(block);
}
