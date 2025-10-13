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
 * Handle nested blocks using section-based approach
 * Finds all accordion blocks in the same section and nests child accordions into parent
 * @param {Element} block - The accordion block element
 */
async function handleNestedBlocks(block) {
  // eslint-disable-next-line no-console
  console.log('=== handleNestedBlocks called ===');
  console.log('Block:', block);

  // Find the section containing this accordion
  const accordionSection = block.closest('.section');
  if (!accordionSection) {
    // eslint-disable-next-line no-console
    console.warn('No section found for accordion');
    return;
  }

  // eslint-disable-next-line no-console
  console.log('Section:', accordionSection);

  // Check if this section has accordion-container class (indicates nested structure)
  if (!accordionSection.classList.contains('accordion-container')) {
    // eslint-disable-next-line no-console
    console.log('Not an accordion-container section, skipping nested logic');
    return;
  }

  // Find all accordion blocks in this section
  const allAccordionBlocks = Array.from(accordionSection.querySelectorAll('.accordion.block'));
  // eslint-disable-next-line no-console
  console.log(`Found ${allAccordionBlocks.length} accordion blocks in section`);

  if (allAccordionBlocks.length < 2) {
    // eslint-disable-next-line no-console
    console.log('Less than 2 accordions, no nesting needed');
    return;
  }

  // First accordion is the parent, rest are children
  const parentAccordion = allAccordionBlocks[0];
  const childAccordions = allAccordionBlocks.slice(1);

  // eslint-disable-next-line no-console
  console.log('Parent accordion:', parentAccordion);
  console.log('Child accordions:', childAccordions);

  // Look for metadata to determine target item index, default to 0
  let itemIndex = 0;
  const metadataBlock = accordionSection.querySelector('.metadata');
  if (metadataBlock) {
    // Hide the metadata block from display
    metadataBlock.style.display = 'none';
    
    // Read metadata
    const metadata = readMetadata(metadataBlock);
    // eslint-disable-next-line no-console
    console.log('Metadata found:', metadata);

    if (metadata['accordion-item'] !== undefined) {
      itemIndex = parseInt(metadata['accordion-item'], 10);
    }
  } else {
    // eslint-disable-next-line no-console
    console.log('No metadata found, using default item index 0');
  }

  // Get the parent accordion's items
  const parentItems = parentAccordion.querySelectorAll('.accordion-item');
  // eslint-disable-next-line no-console
  console.log(`Parent has ${parentItems.length} items, targeting item index ${itemIndex}`);

  if (parentItems[itemIndex]) {
    const targetBody = parentItems[itemIndex].querySelector('.accordion-item-body');
    
    if (targetBody) {
      // eslint-disable-next-line no-console
      console.log('Target body found, moving child accordions...');

      // Move all child accordions into the parent's body
      childAccordions.forEach((childAccordion, idx) => {
        // eslint-disable-next-line no-console
        console.log(`Moving child accordion ${idx + 1} into parent item ${itemIndex}`);
        
        // Clear any existing content in the target body (like placeholder text)
        if (idx === 0) {
          targetBody.innerHTML = '';
        }
        
        // Move the entire child accordion block into the parent's body
        targetBody.appendChild(childAccordion);
      });

      // eslint-disable-next-line no-console
      console.log('✅ Successfully nested child accordions into parent');
    } else {
      // eslint-disable-next-line no-console
      console.warn('Target accordion body not found');
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn(`Parent accordion item at index ${itemIndex} not found`);
  }
}

export default async function decorate(block) {
  // eslint-disable-next-line no-console
  console.log('=== Accordion decorate called ===');
  console.log('Block:', block);

  // First, decorate this accordion's structure
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

  // Check if we're in an accordion-container section
  const section = block.closest('.section');
  if (section && section.classList.contains('accordion-container')) {
    // Mark this block as processed
    block.setAttribute('data-nested-processed', 'true');
    
    // eslint-disable-next-line no-console
    console.log('In accordion-container section');

    // Check if this is the first accordion (parent)
    const allAccordions = Array.from(section.querySelectorAll('.accordion.block'));
    const isFirstAccordion = allAccordions[0] === block;
    
    // eslint-disable-next-line no-console
    console.log(`This is ${isFirstAccordion ? 'PARENT' : 'CHILD'} accordion`);
    console.log(`Total accordions in section: ${allAccordions.length}`);

    // Only the first (parent) accordion should trigger the nesting logic
    if (isFirstAccordion) {
      // Wait a bit for other accordions to be decorated
      setTimeout(() => {
        handleNestedBlocks(block);
      }, 100);
    }
  }
}
