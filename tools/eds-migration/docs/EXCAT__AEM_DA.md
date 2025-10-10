# Adobe AEM Document Authoring (DA) Interactions

This document provides comprehensive guidance for interacting with Adobe AEM Document Authoring (DA) through the CLI tools, focusing on upload and download operations.

## Overview

Adobe Document Authoring (DA) is a content management platform that allows you to download, upload, manage, and publish HTML content. The tools in this directory provide seamless integration with DA for automated content workflows.

## Prerequisites

### Environment Setup

1. **Bearer Token**: You need a valid DA bearer token for authentication
2. **Repository Access**: Access to a DA repository (owner/repo combination)
3. **Node.js**: Ensure Node.js is installed for running the CLI tools

### Environment Configuration

Create a `.env` file in the directory where you run the CLI commands:

```bash
DA_BEARER_TOKEN=your_bearer_token_here
```

## Upload HTML and Assets to DA

### CLI Commands (Recommended)

```bash
# Upload HTML and assets to DA
node tools/eds-migration/cli.js upload-da content.html --owner myorg --repo mysite --asset-list asset-list.json --url https://example.com/page
```

### Programmatic Usage

```javascript
import { uploadToDaWithAemImportHelper } from './aem-import-helper-agent.js';

const result = await uploadToDaWithAemImportHelper({
  uploadToDa: true,
  daOwner: 'myorg',
  daRepo: 'mysite',
  htmlContent: '<html>...</html>',
  assetListFile: 'asset-list.json',
  pageUrl: 'https://example.com/page',
  errors: []
});
```

### Required Parameters

- `uploadToDa`: Boolean to enable DA upload
- `daOwner`: DA organization name  
- `daRepo`: DA repository name
- `htmlContent`: HTML content to upload
- `assetListFile`: Path to asset-list.json file
- `pageUrl`: Full URL of the page being uploaded (used for path generation)

### Asset Processing

The `aem-import-helper` automatically:
- Downloads assets from source URLs
- Uploads images to DA shadow folders (`.page-name` folders)
- Updates HTML URLs to reference DA asset URLs
- Handles parallel processing (up to 50 concurrent uploads)

### File Structure

```
temp-da-upload/
├── da/
│   └── site-name/
│       └── path/
│           └── to/
│               └── page.html
└── asset-list.json
```

**Example for URL `https://www.adobe.com/gallery/basel/`:**
```
temp-da-upload/
├── da/
│   └── adobe-com/
│       └── gallery/
│           └── basel.html
└── asset-list.json
```

### Asset List Format

```json
{
  "assets": [
    "https://example.com/images/logo.jpg",
    "https://example.com/images/banner.png"
  ],
  "siteOrigin": "https://example.com"
}
```

## Download HTML from DA

```bash
# Download to console
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/content/page.html

# Download and save to file
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/content/page.html --output downloaded.html

# Provide token via command line
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/content/page.html --token YOUR_BEARER_TOKEN --output content.html
```

### Parameters

- `da-url` (required): Full DA URL to download from
- `--output` (optional): Local file path to save the content
- `--token` (optional): Bearer token (defaults to `DA_BEARER_TOKEN` env var)

### Examples

```bash
# Download to console (uses DA_BEARER_TOKEN from .env)
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/content/page.html

# Download and save to file
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/content/page.html --output downloaded.html

# Provide token via command line
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/content/page.html --token YOUR_BEARER_TOKEN --output content.html

# Download for validation
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/pages/index.html --output review.html
```

## Modify DA Content

When modifying DA content:

1. **Download first** if you don't have the HTML locally:
   ```bash
   node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/myrepo/content/page.html --output local.html
   ```

2. **Modify the local HTML** as needed

3. **Upload back to DA**:
   ```bash
   node tools/eds-migration/cli.js upload-da local.html --owner myorg --repo mysite --asset-list asset-list.json --url https://example.com/page
   ```

## Path Generation Rules

Folder structure is automatically generated from the full page URL provided to the upload command:

1. **Site Name Generation**: 
   - Removes `www.` prefix from hostname
   - Replaces dots (.) with hyphens (-)
   - Creates root folder: `da/site-name/`

2. **Path Structure**:
   - Mirrors the URL path structure
   - Preserves directory hierarchy
   - Uses original page name with `.html` extension
   - Preserves file extensions for direct file URLs
   - Only uses `index.html` for root URLs
   - Replaces dots with hyphens in path segments
   - Collapses multiple consecutive hyphens
   - Preserves common file extensions (.html, .pdf, .jpg, etc.)

3. **Examples**:
   - `https://www.qantasnewsroom.com.au/gallery/lax-first-class-business-lounges/` → `da/qantasnewsroom-com-au/gallery/lax-first-class-business-lounges.html`
   - `https://www.example.com/blog/post.name.with.dots` → `da/example-com/blog/post-name-with-dots.html`
   - `https://subdomain.example.com/path/to/page---with---multiple---hyphens/` → `da/subdomain-example-com/path/to/page-with-multiple-hyphens.html`
   - `https://example.com/news/article.html` → `da/example-com/news/article.html`
   - `https://example.com/` → `da/example-com/index.html`

## Error Handling

### Common Issues

1. **Missing DA_BEARER_TOKEN**
   - Set environment variable with valid DA bearer token

2. **Invalid Organization/Repository**
   - Verify `daOwner` and `daRepo` parameters

3. **Asset Download Failures**
   - Check asset URLs in the content

4. **Permission Issues**
   - Verify bearer token has proper permissions

5. **Download Not Found (404)**
   - Verify the DA URL is correct and content exists

## API Endpoints

### Upload
```
POST https://admin.da.live/source/{owner}/{repo}/{path}
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

### Download
```
GET https://admin.da.live/source/{owner}/{repo}/{path}
Authorization: Bearer {token}
Accept: application/json
```

## Workflow Examples

### Complete Upload Workflow

```bash
# 1. Upload to DA (assumes HTML and asset-list.json are already prepared)
node tools/eds-migration/cli.js upload-da content.html --owner myorg --repo mysite --asset-list asset-list.json --url https://example.com/page

# 2. Verify upload
node tools/eds-migration/cli.js dl-da https://admin.da.live/source/myorg/mysite/example-com/content.html --output verified.html
```

### Batch Processing

```javascript
const pages = [
  { url: 'https://example.com/page1', html: page1Html, assetList: 'page1-assets.json' },
  { url: 'https://example.com/page2', html: page2Html, assetList: 'page2-assets.json' }
];

for (const page of pages) {
  await uploadToDaWithAemImportHelper({
    uploadToDa: true,
    daOwner: 'myorg',
    daRepo: 'mysite',
    htmlContent: page.html,
    assetListFile: page.assetList
  });
}
```