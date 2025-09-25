/* global WebImporter */
export default function parse(element, { document }) {
  // Helper to extract icon and text from a card div
  function extractCardContent(cardDiv) {
    // Icon (font-awesome <i> element)
    const icon = cardDiv.querySelector('i');
    // Number/figure (span.cartfig)
    const figure = cardDiv.querySelector('.cartfig');
    // Description (p)
    const desc = cardDiv.querySelector('p');

    // Compose the left cell: icon
    let leftCellContent = [];
    if (icon) leftCellContent.push(icon);

    // Compose the right cell: figure (title) and description
    let rightCellContent = [];
    if (figure) {
      const heading = document.createElement('strong');
      heading.textContent = figure.textContent.trim();
      rightCellContent.push(heading);
    }
    if (desc) {
      rightCellContent.push(document.createElement('br'));
      rightCellContent.push(desc);
    }
    return [leftCellContent, rightCellContent];
  }

  // Build table rows
  const rows = [];
  // Header row as specified
  rows.push(['Cards (cards4)']);

  // Get all direct card children
  const cards = element.querySelectorAll(':scope > div');
  cards.forEach(cardDiv => {
    const [iconCell, textCell] = extractCardContent(cardDiv);
    rows.push([iconCell, textCell]);
  });

  // Create the block table
  const blockTable = WebImporter.DOMUtils.createTable(rows, document);

  // Replace the original element
  element.replaceWith(blockTable);
}
