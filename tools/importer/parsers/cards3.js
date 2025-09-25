/* global WebImporter */
export default function parse(element, { document }) {
  // Defensive: Find the cards wrapper
  const cardsWrapper = element.querySelector('.cards__wrapper');
  if (!cardsWrapper) return;
  const cardsList = cardsWrapper.querySelector('.cards__list');
  if (!cardsList) return;

  // Table header
  const headerRow = ['Cards (cards3)'];
  const rows = [headerRow];

  // Find all card items
  const cardItems = Array.from(cardsList.querySelectorAll('.cards__item'));
  cardItems.forEach(cardItem => {
    // Defensive: Find the item wrapper
    const itemWrapper = cardItem.querySelector('.item-wrapper');
    if (!itemWrapper) return;

    // --- Image/Icon cell ---
    let imageCell = null;
    const imageLink = itemWrapper.querySelector('.item-image');
    if (imageLink) {
      // Extract background-image url
      const style = imageLink.getAttribute('style') || '';
      const urlMatch = style.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/);
      if (urlMatch && urlMatch[1]) {
        const img = document.createElement('img');
        img.src = urlMatch[1].trim();
        img.alt = imageLink.getAttribute('alt') || '';
        imageCell = img;
      }
    }

    // --- Text cell ---
    const itemContent = itemWrapper.querySelector('.item-content');
    let textCellContent = [];
    if (itemContent) {
      // Title
      const title = itemContent.querySelector('.item-content__title');
      if (title) {
        const h3 = document.createElement('h3');
        h3.textContent = title.textContent.trim();
        textCellContent.push(h3);
      }
      // Description
      const desc = itemContent.querySelector('.item-content__desc');
      if (desc) {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        textCellContent.push(p);
      }
      // CTA link
      const cta = itemContent.querySelector('.item-content__link');
      if (cta) {
        // Use the existing link element
        textCellContent.push(cta);
      }
    }
    // Tag (e.g., Featured, Coming Soon)
    const tag = itemWrapper.querySelector('.tag');
    if (tag) {
      const span = document.createElement('span');
      span.textContent = tag.textContent.trim();
      span.className = tag.className;
      textCellContent.push(span);
    }

    // Defensive: If no image, leave cell empty
    const row = [imageCell || '', textCellContent];
    rows.push(row);
  });

  // Create the block table
  const block = WebImporter.DOMUtils.createTable(rows, document);
  // Replace the original cards wrapper with the block table
  cardsWrapper.replaceWith(block);
}
