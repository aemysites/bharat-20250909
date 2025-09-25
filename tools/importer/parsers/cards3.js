/* global WebImporter */
export default function parse(element, { document }) {
  // Find the cards wrapper (source block)
  const cardsWrapper = element.querySelector('.cards__wrapper');
  if (!cardsWrapper) return;

  // Find all card items
  const cardItems = cardsWrapper.querySelectorAll('.cards__item');

  // Header row as required
  const headerRow = ['Cards (cards3)'];
  const rows = [headerRow];

  // For each card, extract image/icon, title, description, CTA
  cardItems.forEach((cardItem) => {
    const itemWrapper = cardItem.querySelector('.item-wrapper');
    let imageEl = null;
    // Find image link
    const imageLink = itemWrapper.querySelector('.item-image');
    if (imageLink && imageLink.style.backgroundImage) {
      // Extract image URL from background-image style
      const bgUrlMatch = imageLink.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
      if (bgUrlMatch && bgUrlMatch[1]) {
        imageEl = document.createElement('img');
        imageEl.src = bgUrlMatch[1].trim();
        imageEl.alt = imageLink.getAttribute('alt') || '';
      }
    }

    // If no image, use a 1x1 transparent gif as a placeholder to ensure table structure
    if (!imageEl) {
      imageEl = document.createElement('img');
      imageEl.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
      imageEl.alt = '';
      imageEl.width = 1;
      imageEl.height = 1;
      imageEl.style.opacity = '0';
    }

    // Card content
    const itemContent = itemWrapper.querySelector('.item-content');
    let titleEl = null;
    let descEl = null;
    let ctaEl = null;
    if (itemContent) {
      // Title
      const title = itemContent.querySelector('.item-content__title');
      if (title) {
        titleEl = document.createElement('strong');
        titleEl.textContent = title.textContent.trim();
      }
      // Description
      const desc = itemContent.querySelector('.item-content__desc');
      if (desc) {
        descEl = document.createElement('div');
        descEl.textContent = desc.textContent.trim();
      }
      // CTA
      const cta = itemContent.querySelector('.item-content__link');
      if (cta) {
        ctaEl = document.createElement('a');
        ctaEl.href = cta.href;
        ctaEl.textContent = cta.textContent.trim();
      }
    }

    // Tag (optional, e.g., Featured, Coming Soon)
    const tagEl = itemWrapper.querySelector('.tag');
    let tagSpan = null;
    if (tagEl) {
      tagSpan = document.createElement('span');
      tagSpan.textContent = tagEl.textContent.trim();
      tagSpan.className = tagEl.className;
    }

    // Compose text cell
    const textCellContent = [];
    if (titleEl) textCellContent.push(titleEl);
    if (tagSpan) textCellContent.push(document.createElement('br'), tagSpan);
    if (descEl) textCellContent.push(document.createElement('br'), descEl);
    if (ctaEl) textCellContent.push(document.createElement('br'), ctaEl);

    rows.push([imageEl, textCellContent]);
  });

  // Always create the block (even if only header row)
  const block = WebImporter.DOMUtils.createTable(rows, document);
  cardsWrapper.replaceWith(block);
}
