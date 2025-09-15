/* global WebImporter */
export default function parse(element, { document }) {
  // Only process elements with class 'accordion'
  if (!element.classList.contains('accordion')) return;

  // Table header as per block requirements
  const headerRow = ['Accordion (accordion3)'];
  const rows = [headerRow];

  // Each .card is an accordion item
  const cards = element.querySelectorAll(':scope > .card');
  cards.forEach(card => {
    // Title cell: get the header text (usually in h2 inside .card-header)
    let titleCell = '';
    const header = card.querySelector('.card-header');
    if (header) {
      const heading = header.querySelector('h1, h2, h3, h4, h5, h6');
      titleCell = heading ? heading.textContent.trim() : header.textContent.trim();
    }

    // Content cell: get the .card-body (all content inside the expanded area)
    let contentCell = '';
    const body = card.querySelector('.card-body');
    if (body) {
      // Clone the body to avoid moving nodes from the original DOM
      contentCell = body.cloneNode(true);
    }

    // Push the row if both cells are present
    if (titleCell && contentCell) {
      rows.push([titleCell, contentCell]);
    }
  });

  // Always replace the element with the table, even if only header
  const table = WebImporter.DOMUtils.createTable(rows, document);
  element.replaceWith(table);
}
