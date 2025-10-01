/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

export default async function decorate(block) {
  console.log('=== ACCORDION DECORATE CALLED ===');
  console.log('Block:', block);
  
  // First, try to find the accordion container
  const accordion3Container = document.querySelector('.accordion-container, .accordion3-container, [data-block="accordion3"], .accordion3');
  console.log('Found accordion container:', accordion3Container);
  
  if (accordion3Container) {
    console.log('Processing accordion3 container with all children');
    
    // Find all direct children of the accordion3 container (excluding the accordion block itself)
    const children = Array.from(accordion3Container.children).filter(child => 
      !child.classList.contains('accordion') && 
      !child.classList.contains('accordion-wrapper')
    );
    console.log(`Found ${children.length} children to process`);
    
    if (children.length > 0) {
      // Clear the current block content
      block.innerHTML = '';
      
      for (let index = 0; index < children.length; index++) {
        const child = children[index];
        console.log(`Processing child ${index + 1}:`, child);
        
        // Create accordion item
        const details = document.createElement('details');
        details.className = 'accordion-item';
        
        // Create summary (title) - try to extract from child content
        const summary = document.createElement('summary');
        summary.className = 'accordion-item-label';
        
        // Try to find a meaningful title from the child
        let title = `Item ${index + 1}`;
        
        // Look for headings, labels, or meaningful text
        const heading = child.querySelector('h1, h2, h3, h4, h5, h6, .title, .label, [data-title]');
        if (heading) {
          title = heading.textContent.trim();
        } else {
          // Look for first meaningful text content
          const textContent = child.textContent.trim();
          if (textContent) {
            const lines = textContent.split('\n').map(line => line.trim()).filter(line => 
              line && 
              line !== 'YouTube video player' && 
              !line.startsWith('http') &&
              line.length > 3
            );
            if (lines.length > 0) {
              title = lines[0];
            }
          }
        }
        
        summary.textContent = title;
        
        // Check if the child is a block that needs its JS loaded BEFORE moving it
        const blockElement = child.querySelector('[data-block-name]');
        if (blockElement) {
          const blockName = blockElement.getAttribute('data-block-name');
          console.log(`Loading block JS for: ${blockName} BEFORE moving to accordion`);
          
          // Load the block's JavaScript first
          try {
            const blockModule = await import(`${window.hlx.codeBasePath}/blocks/${blockName}/${blockName}.js`);
            if (blockModule.default) {
              await blockModule.default(blockElement);
              console.log(`Successfully loaded and executed ${blockName} block`);
              console.log('Table structure after table.js:', blockElement.innerHTML);
              
              // Mark the block as loaded to prevent AEM from re-processing it
              blockElement.setAttribute('data-block-status', 'loaded');
            }
          } catch (error) {
            console.warn(`Failed to load block ${blockName}:`, error);
          }
        }
        
        // Create accordion body with child content
        const body = document.createElement('div');
        body.className = 'accordion-item-body';
        
        // Move the child (don't clone) - this removes it from original location
        console.log('Table structure before moving to accordion:', child.innerHTML);
        body.appendChild(child);
        console.log('Table structure after moving to accordion:', child.innerHTML);
        
        // Assemble accordion item
        details.appendChild(summary);
        details.appendChild(body);
        block.appendChild(details);
        
        // Check table structure after accordion is fully assembled
        setTimeout(() => {
          console.log('Table structure after accordion assembly:', child.innerHTML);
        }, 100);
        
        console.log(`Created accordion item: "${title}"`);
      }
      
      console.log(`Created accordion with ${children.length} items`);
      return;
    }
  }
  
  // Default accordion behavior for regular table-based accordions
  // console.log('Using default accordion behavior');
  // [...block.children].forEach((row) => {
  //   // decorate accordion item label
  //   const label = row.children[0];
  //   const summary = document.createElement('summary');
  //   summary.className = 'accordion-item-label';
  //   summary.append(...label.childNodes);
  //   // decorate accordion item body
  //   const body = row.children[1];
  //   body.className = 'accordion-item-body';
  //   // decorate accordion item
  //   const details = document.createElement('details');
  //   moveInstrumentation(row, details);
  //   details.className = 'accordion-item';
  //   details.append(summary, body);
  //   row.replaceWith(details);
  // });
}
