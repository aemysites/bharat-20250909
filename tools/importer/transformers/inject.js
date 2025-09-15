/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable no-console */
(() => {
  try {
    // Main element styling
    try {
      const mainElement = document.querySelector('main.main.left-nav-column, main.main.all-three-column');
      if (mainElement) {
        mainElement.style.flexDirection = 'column';
    
        // make all direct children span the full width
        Array.from(mainElement.children).forEach((child) => {
          child.style.width = '100%';
        });
      }
    } catch (error) {
      console.error('Error processing main element:', error);
    }

    // Remove specific elements
    try {
      // remove slide-out librarian element if present
      document.getElementById('lcs_slide_out-11923')?.remove();
    
      // remove offline chatwidget
      document.querySelector('[aria-label="Chat Widget"]')?.remove();
      document.querySelector('.breadcrumb__wrapper')?.remove();
    } catch (error) {
      console.error('Error removing elements:', error);
    }

    // Remove navigation, header, and footer elements
    try {
      ['.left-nav', 'header.header', 'footer.footer'].forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => el.remove());
      });
    } catch (error) {
      console.error('Error removing navigation elements:', error);
    }

    // Target table processing
    try {
      const targetTable = document.getElementById('table34264');
      if (targetTable) {
        targetTable.classList.add('blu-det-container');
        console.log('Added blu-det-container class to table34264');
      }
    } catch (error) {
      console.error('Error processing target table:', error);
    }

    // Video iframe processing
    try {
      const videoIframes = document.querySelectorAll('iframe[src*="youtube.com/embed"]');
      videoIframes.forEach((iframe) => {
        const sectionAncestor = iframe.closest('section');
        if (sectionAncestor) {
          sectionAncestor.classList.add('blu-det-container');
        }
      });
    } catch (error) {
      console.error('Error processing video iframes:', error);
    }

  } catch (error) {
    console.error('Unexpected error in inject.js:', error);
  }
})();