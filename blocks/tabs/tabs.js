// eslint-disable-next-line import/no-unresolved
import { toClassName, loadBlock } from '../../scripts/aem.js';
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
 * Handles nested blocks within tabs using the section-based metadata pattern.
 *
 * Pattern:
 * - Section contains: parent tabs block + metadata block + child blocks
 * - Metadata block specifies: parent = "tabs", tabs-item = index
 * - Child blocks are moved into the corresponding tab panel body
 *
 * @param {HTMLElement} block - The parent tabs block element
 */
async function handleNestedBlocks(block) {
  // eslint-disable-next-line no-console
  console.log('=== Tabs handleNestedBlocks called ===');
  console.log('Block:', block);

  const section = block.closest('.section');
  if (!section) {
    // eslint-disable-next-line no-console
    console.warn('No section found for tabs');
    return;
  }

  // eslint-disable-next-line no-console
  console.log('Section:', section);

  // Check if this section has tabs-container class (indicates nested structure)
  if (!section.classList.contains('tabs-container')) {
    // eslint-disable-next-line no-console
    console.log('Not a tabs-container section, skipping nested logic');
    return;
  }

  // Get all tabs blocks in this section
  const tabsBlocks = [...section.querySelectorAll('.tabs.block')];
  // eslint-disable-next-line no-console
  console.log(`Found ${tabsBlocks.length} tabs blocks in section`);

  if (tabsBlocks.length === 0) return;

  // First tabs block is the parent
  const parentTabs = tabsBlocks[0];
  if (parentTabs !== block) {
    // eslint-disable-next-line no-console
    console.log('This is not the parent tabs, skipping');
    return;
  }

  // Find all child blocks (excluding tabs and metadata blocks)
  const allBlocks = [...section.querySelectorAll('.block')];
  const childBlocks = allBlocks.filter((child) => {
    return child !== block && !child.classList.contains('tabs') && !child.classList.contains('metadata');
  });

  // eslint-disable-next-line no-console
  console.log(`Found ${childBlocks.length} child blocks to nest`);

  if (childBlocks.length === 0) return;

  // Look for metadata to determine target tab index, default to 0
  let tabIndex = 0;
  const metadataBlock = section.querySelector('.metadata');
  if (metadataBlock) {
    // Hide the metadata block from display
    metadataBlock.style.display = 'none';
    
    // Read metadata
    const metadata = readMetadata(metadataBlock);
    // eslint-disable-next-line no-console
    console.log('Metadata found:', metadata);

    if (metadata['tabs-item'] !== undefined) {
      tabIndex = parseInt(metadata['tabs-item'], 10);
    }
  } else {
    // eslint-disable-next-line no-console
    console.log('No metadata found, using default tab index 0');
  }

  // Process nested child blocks with a delay to ensure parent tabs are ready
  setTimeout(async () => {
    const tabPanels = [...parentTabs.querySelectorAll('.tabs-panel')];
    // eslint-disable-next-line no-console
    console.log(`Parent has ${tabPanels.length} tab panels, targeting panel index ${tabIndex}`);

    const targetPanel = tabPanels[tabIndex];
    if (targetPanel) {
      // eslint-disable-next-line no-console
      console.log('Target panel found, moving child blocks...');

      // Clear any placeholder content in the target panel
      const existingContent = targetPanel.querySelector('div');
      if (existingContent && existingContent.textContent.trim()) {
        // eslint-disable-next-line no-console
        console.log('Clearing existing placeholder content');
        existingContent.remove();
      }

      for (const childBlock of childBlocks) {
        // eslint-disable-next-line no-console
        console.log('Moving child block:', childBlock);
        
        // Move child block into tab panel
        targetPanel.appendChild(childBlock);

        // Load the child block (decorates and loads JS/CSS)
        if (childBlock.dataset.blockStatus === 'initialized' || !childBlock.dataset.blockStatus) {
          // eslint-disable-next-line no-console
          console.log('Loading child block...');
          await loadBlock(childBlock);
        }
      }

      // eslint-disable-next-line no-console
      console.log('✅ Successfully nested child blocks into tab panel');
    } else {
      // eslint-disable-next-line no-console
      console.warn(`Tab panel at index ${tabIndex} not found`);
    }
  }, 100);
}

/**
 * Merge multiple single-tab sections into one multi-tab block
 * This handles the case where each tab is authored as a separate section
 * Returns array of {tabIndex, childBlocks, metadata} for nested content
 */
function mergeTabs(block) {
  // eslint-disable-next-line no-console
  console.log('=== Checking if tabs need to be merged ===');
  
  const section = block.closest('.section');
  if (!section || !section.classList.contains('tabs-container')) {
    return null; // Not a tabs-container, skip merging
  }

  // Check if this is the first tabs block in the parent container
  const parentContainer = section.parentElement;
  const allTabsSections = [...parentContainer.querySelectorAll('.section.tabs-container')];
  
  // eslint-disable-next-line no-console
  console.log(`Found ${allTabsSections.length} tabs sections`);

  if (allTabsSections.length <= 1) {
    return null; // Only one tabs section, no merging needed
  }

  // Get the first tabs section
  const firstSection = allTabsSections[0];
  const firstTabsBlock = firstSection.querySelector('.tabs.block');
  
  // Only process if this is the first tabs block
  if (firstTabsBlock !== block) {
    // eslint-disable-next-line no-console
    console.log('Not the first tabs block, will be merged into first');
    return null;
  }

  // eslint-disable-next-line no-console
  console.log('This is the first tabs block, merging other tabs into it');

  // Store nested content info for each tab before merging
  const nestedContent = [];

  // Collect all tabs from all sections and their child blocks
  allTabsSections.forEach((tabSection, sectionIndex) => {
    // Find child blocks in this section (before merging)
    const allBlocks = [...tabSection.querySelectorAll('.block')];
    const tabsBlock = tabSection.querySelector('.tabs.block');
    const childBlocks = allBlocks.filter((child) => {
      return child !== tabsBlock && !child.classList.contains('metadata');
    });

    // Find metadata to determine tab index
    let tabIndex = sectionIndex; // Default to section index
    const metadataBlock = tabSection.querySelector('.metadata');
    if (metadataBlock) {
      const metadata = readMetadata(metadataBlock);
      if (metadata['tabs-item'] !== undefined) {
        tabIndex = parseInt(metadata['tabs-item'], 10);
      }
      // Hide metadata
      metadataBlock.style.display = 'none';
    }

    // Store child blocks for this tab
    if (childBlocks.length > 0) {
      nestedContent.push({ tabIndex, childBlocks, section: tabSection });
      // eslint-disable-next-line no-console
      console.log(`Tab ${tabIndex} has ${childBlocks.length} child blocks`);
    }

    // Merge tab rows (except from first section)
    if (sectionIndex > 0) {
      const otherTabsBlock = tabSection.querySelector('.tabs.block');
      if (otherTabsBlock) {
        // Move all tab rows from other blocks into the first block
        [...otherTabsBlock.children].forEach((row) => {
          block.appendChild(row);
        });

        // Remove the empty tabs block and its section
        otherTabsBlock.remove();
        tabSection.remove();
      }
    }
  });

  // eslint-disable-next-line no-console
  console.log(`Merged tabs, now have ${block.children.length} tabs total`);
  console.log('Nested content to process:', nestedContent);

  return nestedContent;
}

export default async function decorate(block) {
  // First, merge tabs if needed and collect nested content info
  const nestedContent = mergeTabs(block);

  // If no merge happened, try regular nested blocks handling
  if (!nestedContent) {
    await handleNestedBlocks(block);
  }

  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;

    moveInstrumentation(tab.parentElement, tabpanel.lastElementChild);
    button.innerHTML = tab.innerHTML;

    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();
    moveInstrumentation(button.querySelector('p'), null);
  });

  block.prepend(tablist);

  // Handle nested content after tabs are built
  if (nestedContent && nestedContent.length > 0) {
    setTimeout(async () => {
      const tabPanels = [...block.querySelectorAll('.tabs-panel')];
      // eslint-disable-next-line no-console
      console.log(`Processing ${nestedContent.length} tabs with nested content`);

      for (const { tabIndex, childBlocks } of nestedContent) {
        const targetPanel = tabPanels[tabIndex];
        
        if (targetPanel) {
          // eslint-disable-next-line no-console
          console.log(`Moving ${childBlocks.length} child blocks into tab ${tabIndex}`);
          
          // Clear placeholder content
          const existingContent = targetPanel.querySelector('div');
          if (existingContent && existingContent.textContent.trim()) {
            existingContent.remove();
          }

          for (const childBlock of childBlocks) {
            // Move child block into tab panel
            targetPanel.appendChild(childBlock);

            // Load the child block
            if (childBlock.dataset.blockStatus === 'initialized' || !childBlock.dataset.blockStatus) {
              // eslint-disable-next-line no-console
              console.log(`Loading child block: ${childBlock.className}`);
              await loadBlock(childBlock);
            }
          }
        } else {
          // eslint-disable-next-line no-console
          console.warn(`Tab panel ${tabIndex} not found`);
        }
      }

      // eslint-disable-next-line no-console
      console.log('✅ All nested content processed');
    }, 150);
  }
}
