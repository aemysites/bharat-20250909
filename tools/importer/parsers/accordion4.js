/* global WebImporter */
export default function parse(element, { document }) {
  // The block header row
  const headerRow = ['Accordion (accordion4)'];
  const rows = [headerRow];

  // Select all accordion items ('.card' children)
  const cards = element.querySelectorAll(':scope > .card');
  cards.forEach((card) => {
    // Title cell: from .card-header h2 (or fallback to .card-header text)
    let title = '';
    const cardHeader = card.querySelector('.card-header');
    if (cardHeader) {
      const h2 = cardHeader.querySelector('h2, .h2');
      if (h2) {
        title = h2.textContent.trim();
      } else {
        title = cardHeader.textContent.trim();
      }
    }
    
    // Content cell: all children of .card-body
    let contentCell = '';
    const cardBody = card.querySelector('.card-body');
    if (cardBody) {
      // Defensive: accumulate all direct children of card-body
      // Array to hold all child elements (preserving order & structure)
      const children = Array.from(cardBody.childNodes).filter(
        (node) => node.nodeType === 1 || (node.nodeType === 3 && node.textContent.trim())
      );
      if (children.length === 1) {
        contentCell = children[0];
      } else if (children.length > 1) {
        contentCell = children;
      } else {
        contentCell = cardBody.textContent.trim();
      }
    }
    rows.push([title, contentCell]);
  });

  // Create the block table
  const block = WebImporter.DOMUtils.createTable(rows, document);
  element.replaceWith(block);
}
