/* global WebImporter */
export default function parse(element, { document }) {
  // Header row for block table
  const headerRow = ['Accordion (accordion3)'];

  // Each immediate child .card of the accordion is an accordion item
  const cards = Array.from(element.querySelectorAll(':scope > .card'));
  const rows = [headerRow];

  cards.forEach((card) => {
    // Title: get the .card-header
    const header = card.querySelector('.card-header');
    let titleElem = null;
    if (header) {
      // Use h2 if present, else header itself
      const h2 = header.querySelector('h2');
      titleElem = h2 ? h2 : header;
    }

    // Content: get the .card-body inside the collapse div
    let contentElem = null;
    const collapse = card.querySelector('.collapse');
    if (collapse) {
      const body = collapse.querySelector('.card-body');
      contentElem = body || collapse;
    }

    // Defensive fallback: if no card-header or card-body
    rows.push([
      titleElem || document.createTextNode(''),
      contentElem || document.createTextNode(''),
    ]);
  });

  // Create table block
  const block = WebImporter.DOMUtils.createTable(rows, document);
  element.replaceWith(block);
}
