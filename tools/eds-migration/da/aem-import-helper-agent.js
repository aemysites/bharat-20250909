/* eslint-disable no-console */
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { createDaFolderStructure, getDaFolderPath } from './da-folder-manager.js';

/**
 * Extract asset count from command output
 * @param {string} output - Command output
 * @returns {number} - Number of assets processed
 */
function extractAssetCount(output) {
  // Look for patterns like "Processed X assets" or "Uploaded X files"
  const match = output.match(/(?:Processed|Uploaded|Found)\s+(\d+)\s+(?:assets|files|images)/i);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Execute aem-import-helper da upload command
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result
 */
async function executeAemImportHelperUpload(options) {
  return new Promise((resolve) => {
    const {
      token, org, site, assetList, daFolder, output,
    } = options;

    // Create token file
    const tokenFile = path.join(output, 'token.txt');
    fs.writeFile(tokenFile, token, 'utf8').then(() => {
      // Build command arguments for aem-import-helper
      const args = [
        '--token', tokenFile,
        '--org', org,
        '--site', site,
        '--asset-list', assetList,
        '--da-folder', daFolder,
        '--output', output,
        '--keep', // Keep downloaded assets for debugging
      ];

      console.log('Executing aem-import-helper da upload command...');
      console.log(`Command: npx @adobe/aem-import-helper da upload ${args.join(' ')}`);

      const child = spawn('npx', ['@adobe/aem-import-helper', 'da', 'upload', ...args], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        const stdoutData = data.toString();
        stdout += stdoutData;
        console.log('aem-import-helper stdout:', stdoutData);
      });

      child.stderr.on('data', (data) => {
        const stderrData = data.toString();
        stderr += stderrData;
        console.error('aem-import-helper stderr:', stderrData);
      });

      child.on('close', (code) => {
        if (code === 0) {
          // Parse output to extract asset count if available
          const assetsProcessed = extractAssetCount(stdout);

          resolve({
            success: true,
            assetsProcessed,
            uploadUrl: `https://admin.da.live/source/${org}/${site}/`,
          });
        } else {
          resolve({
            success: false,
            error: `Command failed with exit code ${code}. stderr: ${stderr}`,
          });
        }
      });

      child.on('error', (error) => {
        resolve({
          success: false,
          error: `Failed to start command: ${error.message}`,
        });
      });
    }).catch((error) => {
      resolve({
        success: false,
        error: `Failed to create token file: ${error.message}`,
      });
    });
  });
}

/**
 * Upload HTML content and assets to DA using aem-import-helper
 * Uses pageUrl parameter for generating the correct DA folder structure
 *
 * @param {Object} state - The current state object
 * @returns {Promise<Object>} - Updated state object
 */
async function uploadToDaWithAemImportHelper(state) {
  try {
    const {
      uploadToDa,
      daOwner,
      daRepo,
      htmlContent,
      assetListFile,
      pageUrl,
      keepTempFiles = false,
    } = state;

    if (!uploadToDa) {
      console.log('DA upload not requested, skipping upload');
      return state;
    }

    // Validate required parameters
    const bearerToken = process.env.DA_BEARER_TOKEN;
    const validations = [
      { condition: !htmlContent, message: 'HTML content is required' },
      { condition: !assetListFile, message: 'Asset list file is required' },
      { condition: !pageUrl, message: 'Page URL is required' },
      { condition: !daOwner || !daRepo, message: 'Missing owner or repository' },
      { condition: !bearerToken, message: 'DA_BEARER_TOKEN environment variable not set' },
    ];

    const validationError = validations.find(({ condition }) => condition);
    if (validationError) {
      return {
        ...state,
        errors: [...(state.errors || []), `DA upload failed: ${validationError.message}`],
      };
    }

    // Create temporary directory for processing
    const tempDir = path.join(process.cwd(), 'temp-da-upload', Date.now().toString());
    await fs.mkdir(tempDir, { recursive: true });

    try {
      console.log(`Using page URL: ${pageUrl}`);

      // Create DA folder structure and save HTML
      const htmlFilePath = await createDaFolderStructure(htmlContent, pageUrl, tempDir);
      console.log(`HTML saved to: ${htmlFilePath}`);

      // Copy the provided asset-list.json to temp directory
      const assetListPath = path.join(tempDir, 'asset-list.json');
      await fs.copyFile(assetListFile, assetListPath);
      console.log(`Asset list copied to: ${assetListPath}`);

      // Get DA folder path
      const daFolderPath = getDaFolderPath(tempDir);

      // Execute aem-import-helper da upload command
      const uploadResult = await executeAemImportHelperUpload({
        token: bearerToken,
        org: daOwner,
        site: daRepo,
        assetList: assetListPath,
        daFolder: daFolderPath,
        output: tempDir,
      });

      if (uploadResult.success) {
        console.log('Successfully uploaded HTML and assets to DA using aem-import-helper');
        return {
          ...state,
          daUploadUrl: uploadResult.uploadUrl,
          daUploadResult: {
            success: true,
            method: 'aem-import-helper',
            assetsProcessed: uploadResult.assetsProcessed,
          },
        };
      }
      return {
        ...state,
        errors: [...(state.errors || []), `DA upload failed: ${uploadResult.error}`],
      };
    } finally {
      // Clean up temporary files unless keepTempFiles is true
      if (!keepTempFiles) {
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
        } catch (error) {
          console.warn('Failed to clean up temp directory:', error);
        }
      } else {
        console.log(`Temporary files kept in: ${tempDir}`);
      }
    }
  } catch (error) {
    console.error('Error uploading to DA with aem-import-helper:', error);
    return {
      ...state,
      errors: [...(state.errors || []), `DA upload failed: ${error.message}`],
    };
  }
}

// Export the main function as default
export default uploadToDaWithAemImportHelper;
