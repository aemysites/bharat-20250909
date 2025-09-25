/* global WebImporter */
export default function parse(element, { document }) {
  // Helper to convert iframes to links (for non-img src elements)
  function convertIframeToLink(iframe) {
    if (!iframe || !iframe.src) return null;
    const a = document.createElement('a');
    a.href = iframe.src;
    a.textContent = iframe.src;
    a.target = '_blank';
    return a;
  }

  // Table header row
  const headerRow = ['Accordion3 (accordion3)'];
  const rows = [headerRow];

  // Get all direct child .card elements
  const cards = element.querySelectorAll(':scope > .card');

  cards.forEach(card => {
    // Title cell: get the header text
    let title = '';
    const cardHeader = card.querySelector('.card-header');
    if (cardHeader) {
      const h2 = cardHeader.querySelector('h2, h3, h4, h5, h6');
      title = h2 ? h2.textContent.trim() : cardHeader.textContent.trim();
    }
    // Content cell: get the card-body content
    const cardBody = card.querySelector('.card-body');
    const contentCell = [];
    if (cardBody) {
      Array.from(cardBody.childNodes).forEach(child => {
        if (child.nodeType === 1) { // Element
          if (child.tagName === 'IFRAME') {
            const link = convertIframeToLink(child);
            if (link) contentCell.push(link);
          } else {
            // Recursively replace any iframes inside descendants
            const clone = child.cloneNode(true);
            clone.querySelectorAll('iframe').forEach(iframe => {
              const link = convertIframeToLink(iframe);
              if (link) iframe.replaceWith(link);
            });
            contentCell.push(clone);
          }
        } else if (child.nodeType === 3) { // Text
          if (child.textContent.trim()) {
            const span = document.createElement('span');
            span.textContent = child.textContent;
            contentCell.push(span);
          }
        }
      });
    }
    if (contentCell.length === 0) contentCell.push('');
    rows.push([title, contentCell]);
  });

  // Create the block table
  const table = WebImporter.DOMUtils.createTable(rows, document);
  // Replace the original element
  element.replaceWith(table);
}
