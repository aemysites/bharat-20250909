#!/usr/bin/env node

/* eslint-disable no-console, no-underscore-dangle, no-plusplus */
import dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { convertToHtml } from './html-conversion-agent.js';
import uploadToDaWithAemImportHelper from './da/aem-import-helper-agent.js';
import { fixGridTableFormatting } from './utils/table-formatting.js';
import { makeUrlsAbsolute, makeMarkdownUrlsAbsolute } from './utils/url-processor.js';

// Load .env file from current working directory
dotenv.config();

const commands = {
  'convert-html': {
    description: 'Convert markdown to HTML using EDS pipeline',
    usage: 'convert-html <markdown-file> [--url <base-url>]',
    handler: async (args) => {
      const markdownFile = args._[1];
      const baseUrl = args.url;

      if (!markdownFile) {
        throw new Error('Markdown file path required');
      }

      const markdown = readFileSync(markdownFile, 'utf-8');
      const state = { edsMapping: markdown, url: baseUrl };
      const result = await convertToHtml(state);

      if (result.errors?.length > 0) {
        console.error('Errors:', result.errors);
        process.exit(1);
      }

      console.log(result.htmlContent);
      writeFileSync('content.html', result.htmlContent);
    },
  },

  'generate-asset-list': {
    description: 'Generate asset-list.json from markdown content',
    usage: 'generate-asset-list <markdown-file> --url <base-url> [--output <output-file>]',
    handler: async (args) => {
      const markdownFile = args._[1];
      const { url, output } = args;

      if (!markdownFile || !url) {
        throw new Error('Markdown file and URL are required');
      }

      const markdownContent = readFileSync(markdownFile, 'utf-8');
      const outputFile = output || 'asset-list.json';

      // Extract site origin from URL
      const siteOrigin = new URL(url).origin;

      // Generate asset list
      const { getAssetUrlsFromMarkdown } = await import('@adobe/helix-importer-jcr-packaging');
      const assets = getAssetUrlsFromMarkdown(markdownContent);

      // Create JSON structure with site origin
      const assetList = {
        assets,
        siteOrigin,
      };

      // Write to file
      writeFileSync(outputFile, JSON.stringify(assetList, null, 2));

      console.log(`Generated asset-list.json with ${assetList.assets.length} assets from markdown`);
      console.log(`Asset list saved to: ${outputFile}`);
    },
  },

  'upload-da': {
    description: 'Upload HTML content and assets to Document Authoring using aem-import-helper',
    usage: 'upload-da <html-file> --owner <owner> --repo <repo> --asset-list <asset-list.json> --url <page-url>',
    notes: 'Page URL is required via --url flag to generate correct DA folder structure',
    handler: async (args) => {
      const htmlFile = args._[1];
      const {
        owner, repo, 'asset-list': assetList, url,
      } = args;

      if (!htmlFile || !owner || !repo || !assetList || !url) {
        throw new Error('HTML file, owner, repo, asset-list, and url are required');
      }

      // Page URL is now mandatory via --url flag for explicit control over DA folder structure
      const pageUrl = url;
      console.log('Using page URL for DA folder structure:', pageUrl);

      const htmlContent = readFileSync(htmlFile, 'utf-8');
      const state = {
        uploadToDa: true,
        daOwner: owner,
        daRepo: repo,
        htmlContent,
        assetListFile: assetList,
        pageUrl,
        errors: [],
      };

      const result = await uploadToDaWithAemImportHelper(state);

      if (result.errors?.length > 0) {
        console.error('Errors:', result.errors);
        process.exit(1);
      }

      console.log('Upload successful!');
      console.log('DA Upload URL:', result.daUploadUrl);
      console.log('Upload Result:', result.daUploadResult);
    },
  },

  'fix-tables': {
    description: 'Fix grid table formatting in markdown',
    usage: 'fix-tables <markdown-file>',
    handler: async (args) => {
      const markdownFile = args._[1];

      if (!markdownFile) {
        throw new Error('Markdown file path required');
      }

      const markdown = readFileSync(markdownFile, 'utf-8');
      const fixed = fixGridTableFormatting(markdown);
      console.log(fixed);
    },
  },

  'process-urls': {
    description: 'Convert relative URLs to absolute in HTML or markdown',
    usage: 'process-urls <file> --base-url <url> [--format html|markdown]',
    handler: async (args) => {
      const file = args._[1];
      const baseUrl = args['base-url'];
      const format = args.format || 'html';

      if (!file || !baseUrl) {
        throw new Error('File and base URL required');
      }

      const content = readFileSync(file, 'utf-8');

      let processed;
      if (format === 'markdown') {
        processed = makeMarkdownUrlsAbsolute(content, baseUrl);
      } else {
        processed = makeUrlsAbsolute(content, baseUrl);
      }

      console.log(processed);
    },
  },

  'dl-da': {
    description: 'Download content from Document Authoring',
    usage: 'dl-da <da-url> [--output <file>] [--token <bearer-token>]',
    handler: async (args) => {
      const daUrl = args._[1];
      const { output } = args;
      const token = args.token || process.env.DA_BEARER_TOKEN;

      if (!daUrl) {
        throw new Error('DA URL required');
      }

      if (!token) {
        throw new Error('Bearer token required. Provide via --token or DA_BEARER_TOKEN env var');
      }

      console.log(`Downloading from DA: ${daUrl}`);

      const response = await fetch(daUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }

      const content = await response.text();

      if (output) {
        writeFileSync(output, content, 'utf-8');
        console.log(`Content saved to: ${output}`);
      } else {
        console.log(content);
      }

      console.log(`Download successful from: ${daUrl}`);
    },
  },

  preview: {
    description: 'Trigger preview build for content in AEM/EDS',
    usage: 'preview --org <org> --site <site> --path <path> [--ref <ref>] [--token <bearer-token>]',
    handler: async (args) => {
      const {
        org, site, path, ref = 'main',
      } = args;
      const token = args.token || process.env.DA_BEARER_TOKEN;

      if (!org || !site || !path) {
        throw new Error('Organization, site, and path are required');
      }

      if (!token) {
        throw new Error('Bearer token required. Provide via --token or DA_BEARER_TOKEN env var');
      }

      // Ensure path doesn't start with slash for the API
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      const previewApiUrl = `https://admin.hlx.page/preview/${org}/${site}/${ref}/${cleanPath}`;

      console.log(`Triggering preview build: ${previewApiUrl}`);

      const response = await fetch(previewApiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Preview build failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
      }

      const result = await response.text();
      console.log('Preview build triggered successfully');

      // Generate preview URL
      const pathWithoutHtml = cleanPath.replace(/\.html$/, '');
      const previewUrl = `https://${ref}--${site}--${org}.aem.page/${pathWithoutHtml}`;

      console.log(`Preview URL: ${previewUrl}`);

      if (result) {
        console.log('API Response:', result);
      }
    },
  },
};

function parseArgs(argv) {
  const args = { _: [] };
  let i = 2; // Skip node and script name

  while (i < argv.length) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      if (value && !value.startsWith('--')) {
        args[key] = value;
        i += 2;
      } else {
        args[key] = true;
        i += 1;
      }
    } else {
      args._.push(arg);
      i++;
    }
  }

  return args;
}

function showHelp() {
  console.log('Usage: node cli.js <command> [options]');
  console.log('\nCommands:');

  Object.entries(commands).forEach(([name, cmd]) => {
    console.log(`  ${name.padEnd(15)} ${cmd.description}`);
    console.log(`  ${' '.repeat(15)} ${cmd.usage}`);
    console.log();
  });
}

async function main() {
  const args = parseArgs(process.argv);
  const command = args._[0];

  if (!command || command === 'help' || args.help) {
    showHelp();
    return;
  }

  const cmd = commands[command];
  if (!cmd) {
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }

  try {
    await cmd.handler(args);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
