/* global WebImporter */
export default function parse(element, { document }) {
  // Helper: create header row
  const headerRow = ['Accordion3 (accordion3)'];
  const rows = [headerRow];

  // Defensive: get all direct child .card elements (each accordion item)
  const cards = element.querySelectorAll(':scope > .card');

  cards.forEach((card) => {
    // Title cell: get .card-header > h2 (or fallback to .card-header text)
    let titleCell;
    const header = card.querySelector('.card-header');
    if (header) {
      const h2 = header.querySelector('h2');
      titleCell = h2 ? h2 : header;
    } else {
      titleCell = document.createElement('span');
      titleCell.textContent = 'Accordion Item';
    }

    // Content cell: get .card-body (all content)
    let contentCell;
    const body = card.querySelector('.card-body');
    if (body) {
      // Defensive: replace iframes with links (not images)
      const iframes = body.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        // Only replace if not inside an <img>
        if (iframe.parentElement && iframe.parentElement.tagName !== 'IMG') {
          const link = document.createElement('a');
          link.href = iframe.src;
          link.textContent = iframe.src;
          // Replace iframe with link
          iframe.replaceWith(link);
        }
      });
      contentCell = body;
    } else {
      contentCell = document.createElement('span');
      contentCell.textContent = '';
    }

    rows.push([titleCell, contentCell]);
  });

  // Create and replace block table
  const table = WebImporter.DOMUtils.createTable(rows, document);
  element.replaceWith(table);
}
