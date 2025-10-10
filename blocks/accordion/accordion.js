/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Read metadata from a metadata block
 * @param {Element} metadataBlock - The metadata block element
 * @returns {Object} - Object with metadata key-value pairs
 */
function readMetadata(metadataBlock) {
  const metadata = {};
  const rows = metadataBlock.querySelectorAll(':scope > div > div');

  for (let i = 0; i < rows.length; i += 2) {
    const key = rows[i]?.textContent?.trim();
    const value = rows[i + 1]?.textContent?.trim();
    if (key && value) {
      metadata[key] = value;
    }
  }

  return metadata;
}

/**
 * Handle nested blocks by finding metadata blocks and injecting content into accordion items
 * @param {Element} block - The accordion block element
 */
function handleNestedBlocks(block) {
  // Find the section containing this accordion
  const accordionSection = block.closest('.section');
  if (!accordionSection) return;

  // Get all accordion items from this block
  const accordionItems = block.querySelectorAll('.accordion-item');

  // CASE 1: Check if metadata and embed are in the SAME section (siblings)
  const metadataInSameSection = accordionSection.querySelector('.metadata');
  if (metadataInSameSection) {
    // Read metadata
    const metadata = readMetadata(metadataInSameSection);

    // Check if this metadata points to our accordion
    if (metadata.parent === 'accordion' && metadata['accordion-item'] !== undefined) {
      const itemIndex = parseInt(metadata['accordion-item'], 10);

      // Find the corresponding accordion item
      const targetAccordionItem = accordionItems[itemIndex];
      if (targetAccordionItem) {
        // Find the accordion body to append content to
        const accordionBody = targetAccordionItem.querySelector('.accordion-item-body');
        if (accordionBody) {
          // Find embed/video blocks in the same section (siblings of accordion)
          const embedBlocks = accordionSection.querySelectorAll('.embed, .video');
          embedBlocks.forEach((embedBlock) => {
            accordionBody.appendChild(embedBlock);
          });
        }
      }
    }
    // After handling same-section blocks, we're done
    return;
  }

  // CASE 2: Look for metadata in subsequent sections (Strategy E pattern)
  const main = accordionSection.closest('main');
  if (!main) return;

  const allSections = Array.from(main.querySelectorAll('.section'));
  const accordionIndex = allSections.indexOf(accordionSection);

  // Look at sections after the accordion
  for (let i = accordionIndex + 1; i < allSections.length; i++) {
    const section = allSections[i];

    // Check if this section has a metadata block
    const metadataBlock = section.querySelector('.metadata');
    if (!metadataBlock) continue;

    // Read metadata
    const metadata = readMetadata(metadataBlock);

    // Check if this section's metadata points to our accordion
    if (metadata.parent === 'accordion' && metadata['accordion-item'] !== undefined) {
      const itemIndex = parseInt(metadata['accordion-item'], 10);

      // Find the corresponding accordion item
      const targetAccordionItem = accordionItems[itemIndex];
      if (!targetAccordionItem) continue;

      // Find the accordion body to append content to
      const accordionBody = targetAccordionItem.querySelector('.accordion-item-body');
      if (!accordionBody) continue;

      // Find all blocks in this section (excluding metadata block)
      const blocks = Array.from(section.children).filter((child) => {
        return !child.classList.contains('metadata')
          && (child.classList.contains('embed')
            || child.classList.contains('video')
            || child.tagName === 'DIV');
      });

      // Append each block to the accordion body
      blocks.forEach((blockToMove) => {
        accordionBody.appendChild(blockToMove);
      });

      // Hide the now-empty section
      section.style.display = 'none';
    }
  }
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';
    // decorate accordion item
    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
  });

  // Handle nested blocks after accordion is decorated
  handleNestedBlocks(block);
  
  // NEW: Handle embed blocks in the same section (accordion-container with embed-container)
  const accordionSection = block.closest('.section');
  if (accordionSection && accordionSection.classList.contains('embed-container')) {
    // Hide metadata blocks (they shouldn't be visible)
    const metadataBlocks = accordionSection.querySelectorAll('.metadata');
    metadataBlocks.forEach((metadata) => {
      metadata.style.display = 'none';
    });
    
    // Find all embed blocks that are siblings (at section level)
    const embedWrappers = accordionSection.querySelectorAll(':scope > .embed-wrapper');
    
    if (embedWrappers.length > 0) {
      // Get the first (or last, depending on your preference) accordion item
      const accordionItems = block.querySelectorAll('.accordion-item');
      const lastAccordionItem = accordionItems[accordionItems.length - 1];
      
      if (lastAccordionItem) {
        const accordionBody = lastAccordionItem.querySelector('.accordion-item-body');
        
        if (accordionBody) {
          // Move all embed blocks into the last accordion item
          embedWrappers.forEach((embedWrapper) => {
            accordionBody.appendChild(embedWrapper);
          });
        }
      }
    }
  }
}
