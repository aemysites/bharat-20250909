/* eslint-disable no-console */
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Generate path structure from URL for DA folder organization
 * @param {string} url - The original URL (e.g., https://www.qantasnewsroom.com.au/gallery/karratha-regional-lounge-western-australia/)
 * @returns {Object} - Object with siteName, pagePath, and fileName
 */
export function generatePathStructureFromUrl(url) {
  try {
    const urlObj = new URL(url);

    // Generate site name from hostname
    let siteName = urlObj.hostname;
    // Remove www. prefix
    if (siteName.startsWith('www.')) {
      siteName = siteName.substring(4);
    }
    // Replace dots with hyphens
    siteName = siteName.replace(/\./g, '-');

    // Process pathname
    let { pathname } = urlObj;
    // Decode URL-encoded characters (spaces, etc.) to handle both raw and encoded URLs
    pathname = decodeURIComponent(pathname);
    // Remove leading/trailing slashes
    pathname = pathname.replace(/^\/+|\/+$/g, '');

    // Split into path segments and clean them, filtering out empty segments
    const pathSegments = pathname ? pathname.split('/').filter(segment => segment.length > 0) : [];

    // Clean path segments: replace special characters with hyphens and collapse multiple hyphens
    const cleanedSegments = pathSegments.map((segment) => {
      if (!segment) return segment;
      // Convert to lowercase and replace any non-alphanumeric character (except hyphens) with hyphens
      let cleaned = segment.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      // Collapse multiple consecutive hyphens
      cleaned = cleaned.replace(/-+/g, '-');
      // Remove leading/trailing hyphens
      cleaned = cleaned.replace(/^-+|-+$/g, '');
      return cleaned;
    });

    // Determine page path and file name
    let pagePath = '';
    let fileName = 'index.html';

    if (cleanedSegments.length === 0) {
      // Root page: site-name/index.html
      pagePath = '';
      fileName = 'index.html';
    } else {
      // Check if last segment has an extension (before cleaning)
      const lastOriginalSegment = pathSegments[pathSegments.length - 1];
      // Only consider it a file extension if it's a common web file extension
      const commonExtensions = [
        '.html', '.htm', '.php', '.asp', '.aspx', '.jsp', '.pdf',
        '.doc', '.docx', '.txt', '.xml', '.json', '.css', '.js',
        '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
      ];
      const hasExtension = commonExtensions.some((ext) => {
        const lowerSegment = lastOriginalSegment.toLowerCase();
        return lowerSegment.endsWith(ext);
      });

      if (hasExtension) {
        // Last segment is a file: preserve the original extension
        const originalSegment = pathSegments[pathSegments.length - 1];
        const extension = originalSegment.substring(originalSegment.lastIndexOf('.'));
        const nameWithoutExt = originalSegment.substring(0, originalSegment.lastIndexOf('.'));
        // Clean the name part (convert to lowercase, replace non-alphanumeric chars with hyphens, collapse hyphens)
        const cleanedName = nameWithoutExt.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
        fileName = cleanedName + extension;
        pagePath = cleanedSegments.slice(0, -1).join('/');
      } else {
        // Last segment is a directory: use the directory name as the page name
        // site-name/path/to/page-name.html
        const pageName = cleanedSegments[cleanedSegments.length - 1];
        fileName = `${pageName}.html`;
        pagePath = cleanedSegments.slice(0, -1).join('/');
      }
    }

    return {
      siteName,
      pagePath,
      fileName,
    };
  } catch (error) {
    console.warn(`Failed to generate path structure from URL: ${url}`, error);
    return {
      siteName: `site-${Date.now()}`,
      pagePath: '',
      fileName: 'index.html',
    };
  }
}

/**
 * Create DA folder structure and save HTML file
 * @param {string} htmlContent - The HTML content to save
 * @param {string} url - The page URL
 * @param {string} outputDir - Base output directory
 * @returns {Promise<string>} - Path to the created HTML file
 */
export async function createDaFolderStructure(htmlContent, url, outputDir) {
  try {
    // Create da folder if it doesn't exist
    const daFolder = path.join(outputDir, 'da');
    await fs.mkdir(daFolder, { recursive: true });

    // Generate site name and path structure from url
    const { siteName, pagePath, fileName } = generatePathStructureFromUrl(url);

    // Create full path: da/site-name/path/to/page.html
    const fullPath = path.join(daFolder, siteName, pagePath);
    await fs.mkdir(fullPath, { recursive: true });

    // Generate HTML file path
    const htmlFilePath = path.join(fullPath, fileName);

    // Save HTML content
    await fs.writeFile(htmlFilePath, htmlContent, 'utf8');

    console.log('Created DA folder structure:');
    console.log(`  - DA folder: ${daFolder}`);
    console.log(`  - Site folder: ${path.join(daFolder, siteName)}`);
    console.log(`  - Full path: ${fullPath}`);
    console.log(`  - HTML file: ${htmlFilePath}`);

    return htmlFilePath;
  } catch (error) {
    console.error('Error creating DA folder structure:', error);
    throw error;
  }
}

/**
 * Generate a page name from URL (legacy function for backward compatibility)
 * @param {string} url - The original URL
 * @returns {string} - Generated page name
 */
export function generatePageNameFromUrl(url) {
  const { siteName, pagePath, fileName } = generatePathStructureFromUrl(url);
  const fullPath = pagePath ? `${siteName}/${pagePath}/${fileName}` : `${siteName}/${fileName}`;
  return fullPath.replace(/\//g, '-').replace(/\.html$/, '');
}

/**
 * Get the DA folder path
 * @param {string} outputDir - Base output directory
 * @returns {string} - Path to the da folder
 */
export function getDaFolderPath(outputDir) {
  return path.join(outputDir, 'da');
}
