# AEM Import Helper Integration

Upload HTML content and assets to Adobe Document Authoring (DA) using the `@adobe/aem-import-helper` library.

## Quick Start

### 1. Setup
```bash
cd tools/eds-migration
npm install
```

**Configure DA Bearer Token** (choose one method):

**Option A: .env File**
Create a `.env` file in the directory where you run the CLI commands:
```bash
echo "DA_BEARER_TOKEN=your_da_bearer_token_here" > .env
```

**Option B: Environment Variable**
```bash
export DA_BEARER_TOKEN=your_da_bearer_token_here
```

### 2. Usage

#### CLI Commands (Recommended)
```bash
# Convert markdown to HTML
node cli.js convert-html content.md --url https://example.com/page

# Generate asset list from markdown
node cli.js generate-asset-list content.md --url https://example.com/page

# Upload HTML and assets to DA
node cli.js upload-da content.html --owner myorg --repo mysite --asset-list asset-list.json --url https://example.com/page
```

#### Programmatic Usage
```javascript
import { uploadToDaWithAemImportHelper } from './aem-import-helper-agent.js';

const state = {
  uploadToDa: true,
  daOwner: 'myorg',
  daRepo: 'mysite',
  htmlContent: '<html>...</html>',
  assetListFile: 'asset-list.json',
  pageUrl: 'https://example.com/page',
  errors: []
};

const result = await uploadToDaWithAemImportHelper(state);
```

## Workflow

```
Markdown → HTML Conversion → Asset List Generation → DA Upload
    ↓              ↓                    ↓              ↓
content.md → content.html → asset-list.json → DA (HTML + Assets)
```

### Step-by-Step Process

1. **Convert Markdown to HTML** - Uses EDS pipeline
2. **Extract Assets** - From markdown using `@adobe/helix-importer-jcr-packaging`
3. **Generate Asset List** - Creates `asset-list.json` with assets and site origin
4. **Create DA Structure** - Creates `da/site-name/path/to/page.html` folder structure from the provided page URL
5. **Upload to DA** - Uses `aem-import-helper` to upload HTML and download/upload assets

## Required Parameters

- `uploadToDa`: Boolean to enable DA upload
- `daOwner`: DA organization name  
- `daRepo`: DA repository name
- `htmlContent`: HTML content to upload
- `assetListFile`: Path to asset-list.json file
- `pageUrl`: Page URL for generating correct DA folder structure (required via --url flag)

## DA Folder Structure Generation

The folder structure is automatically generated from the page URL provided via the `--url` parameter:

- **Site name**: Hostname with `www.` removed and dots replaced with hyphens
- **Path structure**: Mirrors the URL path hierarchy
- **File naming**: Uses original page name with `.html` extension, or `index.html` for root URLs

**Examples**:
- `https://www.example.com/blog/post` → `da/example-com/blog/post.html`
- `https://example.com/` → `da/example-com/index.html`

For detailed path generation rules, see the main [AEM DA Documentation](../docs/EXCAT__AEM_DA.md#path-generation-rules).

## Asset Processing

The `aem-import-helper` automatically:
- Downloads assets from source URLs
- Uploads images to DA shadow folders (`.page-name` folders)
- Updates HTML URLs to reference DA asset URLs
- Handles parallel processing (up to 50 concurrent uploads)

## File Structure

### Input Structure
```
temp-da-upload/
├── da/
│   └── page-name/
│       └── page-name.html
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

## Error Handling

Common issues and solutions:

1. **Missing DA_BEARER_TOKEN**
   - Set environment variable with valid DA bearer token

2. **Invalid Organization/Repository**
   - Verify `daOwner` and `daRepo` parameters

3. **Asset Download Failures**
   - Check asset URLs in the content

4. **Permission Issues**
   - Verify bearer token has proper permissions

## Debug Mode

Set `keepTempFiles: true` to keep temporary files for inspection:
```javascript
const state = {
  // ... other properties
  keepTempFiles: true
};
```

## Dependencies

- `@adobe/aem-import-helper`: ^1.2.2
- `@adobe/helix-importer-jcr-packaging`: Asset extraction from markdown

## References

- [AEM Import Helper GitHub](https://github.com/adobe/aem-import-helper)
- [Adobe DA Documentation](https://www.aem.live/docs/)