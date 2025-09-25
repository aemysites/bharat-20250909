/* global WebImporter */
export default function parse(element, { document }) {
  // 1. Block header row
  const headerRow = ['Embed3 (embed3)'];

  // 2. Extract the iframe src
  const iframe = element;
  let videoUrl = '';
  if (iframe && iframe.src) {
    videoUrl = iframe.src;
    // Convert embed URLs to canonical video URLs (YouTube/Vimeo)
    if (/youtube\.com\/embed\//.test(videoUrl)) {
      const videoId = videoUrl.split('/embed/')[1]?.split(/[?&]/)[0];
      if (videoId) {
        videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      }
    } else if (/vimeo\.com\/video\//.test(videoUrl)) {
      const videoId = videoUrl.split('/video/')[1]?.split(/[?&]/)[0];
      if (videoId) {
        videoUrl = `https://vimeo.com/${videoId}`;
      }
    }
  }

  // 3. Try to extract any visible text content near the iframe (e.g., from parent or siblings)
  let extraText = '';
  // Check parent for text nodes or headings
  if (element.parentElement) {
    // Get all text content except inside iframes
    extraText = Array.from(element.parentElement.childNodes)
      .filter(node => node !== element && node.nodeType === Node.TEXT_NODE && node.textContent.trim())
      .map(node => node.textContent.trim())
      .join(' ');
    // If no direct text, look for heading or paragraph siblings
    if (!extraText) {
      const heading = element.parentElement.querySelector('h1, h2, h3, h4, h5, h6, p');
      if (heading && heading.textContent.trim()) {
        extraText = heading.textContent.trim();
      }
    }
  }

  // 4. Create the link element for the video URL
  let linkEl = null;
  if (videoUrl) {
    linkEl = document.createElement('a');
    linkEl.href = videoUrl;
    linkEl.textContent = videoUrl;
  }

  // 5. Compose cell content: include extra text if present
  const cellContent = [];
  if (extraText) {
    cellContent.push(extraText);
  }
  if (linkEl) {
    cellContent.push(linkEl);
  }

  // 6. Build the table
  const rows = [
    headerRow,
    [cellContent]
  ];
  const table = WebImporter.DOMUtils.createTable(rows, document);

  // 7. Replace original element with block table
  element.replaceWith(table);
}
