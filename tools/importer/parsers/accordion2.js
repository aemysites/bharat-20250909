/* global WebImporter */
export default function parse(element, { document }) {
  // Prepare header row as required
  const headerRow = ['Accordion (accordion2)'];

  // Defensive: find card header (title) and body (content)
  let title, content;

  // The immediate children: header and (optional) collapse/body
  const children = Array.from(element.querySelectorAll(':scope > div'));

  // Find header and collapse content
  const headerDiv = children.find((c) => c.classList.contains('card-header'));
  const collapseDiv = children.find((c) => c.classList.contains('collapse'));

  // Title extraction
  if (headerDiv) {
    // Normally header contains h2/h6 or similar for the label
    const h2 = headerDiv.querySelector('h2,h3,h4,h5,h6');
    // Fallback to text if needed
    title = h2 ? h2 : headerDiv;
  } else {
    title = document.createTextNode('');
  }

  // Content extraction
  let contentBody;
  if (collapseDiv) {
    // Usually content is in card-body or similar inside collapseDiv
    contentBody = collapseDiv.querySelector('.card-body') || collapseDiv;
  }

  // Defensive: if no content found, use empty text node
  content = contentBody ? contentBody : document.createTextNode('');

  // Compose rows: header, then each item [title, content]
  const rows = [headerRow, [title, content]];

  // Create block table
  const block = WebImporter.DOMUtils.createTable(rows, document);

  // Replace the original element
  element.replaceWith(block);
}
