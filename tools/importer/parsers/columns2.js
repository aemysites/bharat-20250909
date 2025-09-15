/* global WebImporter */
export default function parse(element, { document }) {
  // Defensive: get all immediate children of the main block
  const children = Array.from(element.querySelectorAll(':scope > div'));

  // Find the logo area
  const logoDiv = children.find(div => div.classList.contains('header-main__logos'));
  // Find the search area
  const searchDiv = children.find(div => div.classList.contains('search-catalogue'));
  // Find the nav area
  const navDiv = children.find(div => div.classList.contains('main-nav'));

  // Compose left column: logos and "Library" text
  let leftColumnContent = [];
  if (logoDiv) {
    leftColumnContent.push(logoDiv);
  }
  // Add the "Library" text if present
  // It's not in a separate element, but in the screenshot it's next to the logo
  // We'll create a span for it
  const libraryText = document.createElement('span');
  libraryText.textContent = 'Library';
  libraryText.style.marginLeft = '8px';
  leftColumnContent.push(libraryText);

  // Compose right column: search box and nav
  let rightColumnContent = [];
  if (searchDiv) {
    rightColumnContent.push(searchDiv);
  }
  if (navDiv) {
    rightColumnContent.push(navDiv);
  }

  // Table header
  const headerRow = ['Columns block (columns2)'];
  // Table content row: two columns
  const contentRow = [leftColumnContent, rightColumnContent];

  const cells = [headerRow, contentRow];
  const table = WebImporter.DOMUtils.createTable(cells, document);

  element.replaceWith(table);
}
