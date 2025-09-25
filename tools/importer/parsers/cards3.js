/* global WebImporter */
export default function parse(element, { document }) {
  // Find the card list container within the given element
  const cardsWrapper = element.querySelector('.cards__wrapper, .cards-wrapper');
  if (!cardsWrapper) return;
  const cardsList = cardsWrapper.querySelector('.cards__list');
  if (!cardsList) return;

  // Table header as required
  const headerRow = ['Cards (cards3)'];
  const rows = [headerRow];

  // Process each card
  cardsList.querySelectorAll(':scope > li.cards__item').forEach((cardItem) => {
    // Get the item wrapper
    const itemWrapper = cardItem.querySelector('.item-wrapper');
    if (!itemWrapper) return;

    // Image: .item-image (background-image style)
    let imageEl = null;
    const imgLink = itemWrapper.querySelector('.item-image');
    if (imgLink) {
      // Extract url from background-image
      const bg = imgLink.style.backgroundImage;
      const urlMatch = bg && bg.match(/url\(['"]?([^'")]+)['"]?\)/);
      if (urlMatch && urlMatch[1]) {
        imageEl = document.createElement('img');
        imageEl.src = urlMatch[1].trim();
        imageEl.alt = imgLink.getAttribute('alt') || '';
      }
    }

    // Content: .item-content
    const itemContent = itemWrapper.querySelector('.item-content');
    let textCellContent = [];
    if (itemContent) {
      // Tag/label (e.g. "Coming Soon", "Featured")
      const tag = itemWrapper.querySelector('.tag');
      if (tag) {
        const tagSpan = document.createElement('span');
        tagSpan.textContent = tag.textContent.trim();
        tagSpan.className = tag.className;
        textCellContent.push(tagSpan);
        textCellContent.push(document.createElement('br'));
      }
      // Title
      const title = itemContent.querySelector('.item-content__title');
      if (title) {
        const h = document.createElement('strong');
        h.textContent = title.textContent.trim();
        textCellContent.push(h);
        textCellContent.push(document.createElement('br'));
      }
      // Description
      const desc = itemContent.querySelector('.item-content__desc');
      if (desc) {
        const div = document.createElement('div');
        div.innerHTML = desc.innerHTML;
        textCellContent.push(div);
      }
      // CTA link
      const cta = itemContent.querySelector('.item-content__link');
      if (cta) {
        textCellContent.push(document.createElement('br'));
        const link = document.createElement('a');
        link.href = cta.href;
        link.textContent = cta.textContent.trim();
        textCellContent.push(link);
      }
    }

    // Only push a row if imageEl exists (NO empty image columns)
    if (imageEl) {
      rows.push([imageEl, textCellContent]);
    }
  });

  if (rows.length > 1) {
    const block = WebImporter.DOMUtils.createTable(rows, document);
    cardsWrapper.replaceWith(block);
  }
}
