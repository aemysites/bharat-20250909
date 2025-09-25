/* global WebImporter */
export default function parse(element, { document }) {
  // Find the cards wrapper
  const cardsWrapper = element.querySelector('.cards__wrapper');
  if (!cardsWrapper) return;

  // Find the actual cards list
  const cardsList = cardsWrapper.querySelector('.cards__list');
  if (!cardsList) return;

  // Get all card items
  const cardItems = Array.from(cardsList.querySelectorAll('.cards__item'));

  // Header row as per block spec
  const headerRow = ['Cards (cards3)'];
  const rows = [headerRow];

  cardItems.forEach((cardItem) => {
    const itemWrapper = cardItem.querySelector('.item-wrapper');
    if (!itemWrapper) return;

    // --- IMAGE/ICON CELL ---
    let imageCell = '';
    const imageAnchor = itemWrapper.querySelector('.item-image');
    if (imageAnchor && imageAnchor.style.backgroundImage) {
      const bgUrlMatch = imageAnchor.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
      if (bgUrlMatch && bgUrlMatch[1]) {
        const img = document.createElement('img');
        img.src = bgUrlMatch[1].trim();
        img.alt = imageAnchor.getAttribute('alt') || '';
        imageCell = img;
      }
    } else {
      // If no image, use a 1x1 transparent gif as a placeholder to ensure no empty column
      const img = document.createElement('img');
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
      img.alt = '';
      img.style.display = 'none';
      imageCell = img;
    }

    // --- TEXT CELL ---
    const itemContent = itemWrapper.querySelector('.item-content');
    const textCellContent = [];
    if (itemContent) {
      const title = itemContent.querySelector('.item-content__title');
      if (title) {
        const strong = document.createElement('strong');
        strong.textContent = title.textContent.trim();
        textCellContent.push(strong);
      }
      const desc = itemContent.querySelector('.item-content__desc');
      if (desc) {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        textCellContent.push(p);
      }
      const cta = itemContent.querySelector('.item-content__link');
      if (cta) {
        textCellContent.push(cta);
      }
    }
    const textCell = textCellContent.length ? textCellContent : '';

    rows.push([imageCell, textCell]);
  });

  // Create the block table
  const block = WebImporter.DOMUtils.createTable(rows, document);
  // Replace the cards wrapper with the block table
  cardsWrapper.replaceWith(block);
}
