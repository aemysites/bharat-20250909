/* global WebImporter */
export default function parse(element, { document }) {
  // Always use the required header row for this block
  const headerRow = ['Cards (cards2)'];
  const rows = [headerRow];

  // Find all card items
  const cardItems = element.querySelectorAll('.cards__item');

  cardItems.forEach((card) => {
    const wrapper = card.querySelector('.item-wrapper');
    if (!wrapper) return;

    // --- IMAGE/ICON CELL ---
    let imageCell = null;
    const imageLink = wrapper.querySelector('.item-image');
    if (imageLink && imageLink.style.backgroundImage) {
      const bg = imageLink.style.backgroundImage;
      const urlMatch = bg.match(/url\(['"]?([^'")]+)['"]?\)/);
      if (urlMatch && urlMatch[1]) {
        const img = document.createElement('img');
        img.src = urlMatch[1].trim();
        img.alt = imageLink.getAttribute('alt') || '';
        imageCell = img;
      }
    }
    // If no image, SKIP the card (do not add a row with an empty image cell)
    if (!imageCell) return;

    // --- TEXT CONTENT CELL ---
    // Instead of reconstructing, use the entire .item-content block to ensure all text is included
    const content = wrapper.querySelector('.item-content');
    if (!content) return;
    const contentClone = content.cloneNode(true);
    // Also append the tag if present
    const tag = wrapper.querySelector('.tag');
    if (tag) {
      contentClone.appendChild(tag.cloneNode(true));
    }
    rows.push([imageCell, contentClone]);
  });

  // Create the table and replace the element
  const table = WebImporter.DOMUtils.createTable(rows, document);
  element.replaceWith(table);
}
