/**
 * Simple Console Script - Remove Header, Footer, Side Nav
 * Based on inventory analysis of Western Sydney University Library page
 * Run this in browser console
 */

// Quick removal function
function removeElements() {
    console.log('🚀 Removing header, footer, and side navigation...');
    
    // Remove header
    const header = document.querySelector('header');
    if (header) {
        header.remove();
        console.log('✅ Header removed');
    }
    
    // Remove footer
    const footer = document.querySelector('footer');
    if (footer) {
        footer.remove();
        console.log('✅ Footer removed');
    }
    
    // Remove left navigation
    const leftNav = document.querySelector('.left-nav');
    if (leftNav) {
        leftNav.remove();
        console.log('✅ Left navigation removed');
    }
    
    // Remove breadcrumb
    const breadcrumb = document.querySelector('.breadcrumb__wrapper');
    if (breadcrumb) {
        breadcrumb.remove();
        console.log('✅ Breadcrumb removed');
    }
    
    // Clean up main element
    // const main = document.querySelector('main.main');
    // if (main) {
    //     main.classList.remove('left-nav-column');
    //     main.style.marginLeft = '0';
    //     main.style.paddingLeft = '20px';
    //     main.style.paddingRight = '20px';
    //     console.log('✅ Main layout adjusted');
    // }
    
    // Clean up page content
    // const pageContent = document.querySelector('.page-content');
    // if (pageContent) {
    //     pageContent.style.marginLeft = '0';
    //     pageContent.style.paddingLeft = '20px';
    //     pageContent.style.paddingRight = '20px';
    //     console.log('✅ Page content adjusted');
    // }
    
    // Remove page wrapper
    const pageWrapper = document.querySelector('.page-wrapper');
    if (pageWrapper) {
        // Move main content out of wrapper
        const main = document.querySelector('main.main');
        if (main) {
            pageWrapper.parentNode.insertBefore(main, pageWrapper);
        }
        pageWrapper.remove();
        console.log('✅ Page wrapper removed');
    }
    
    console.log('🎉 Cleanup completed!');
}

// Run the removal
removeElements();
