# EDS Migration Tools & Documentation

A comprehensive toolkit for migrating websites to Adobe Edge Delivery Services (EDS) and managing EDS projects.

## Overview

This directory contains documentation, configuration files, CLI tools, and helper scripts for:
- Migrating web content to EDS
- Understanding EDS development patterns
- Troubleshooting common issues
- Managing blocks and design tokens
- Interacting with Adobe Document Authoring (DA)

## Directory Structure

```
tools/eds-migration/
├── README.md                  # This file
├── docs/                      # Documentation files
├── config/                    # Configuration and reference files
└── helpers/                   # Helper scripts
```

### Documentation (`docs/`)

Core documentation for EDS development and migration:

| File | Purpose |
|------|---------|
| **EXCAT__AEM_EDS.md** | EDS development best practices, project structure, and coding guidelines |
| **EXCAT__AEM_DA.md** | Document Authoring API interactions and CLI tool usage |
| **EXCAT__AGENTIC_WORKFLOW.md** | Step-by-step web content migration workflow |
| **EXCAT__AUTOMATED_BLOCK_GENERATION.md** | Block generation from web pages with visual analysis |
| **EXCAT__DEBUGGING.md** | Systematic debugging approaches and CLI commands |
| **EXCAT__DESIGN_TOKENS.md** | Design tokens reference and adaptation guide |
| **EXCAT__IMAGE_TROUBLESHOOTING.md** | Image handling issues and solutions |
| **NAVIGATION.md** | Navigation setup and link styling troubleshooting |

### Configuration (`config/`)

Reference materials and configuration files:

| File | Purpose |
|------|---------|
| **sta-boilerplate-block-library-no-images.json** | EDS block library with descriptions and examples |
| **block-showcase.md** | Reusable template with markdown examples for all blocks |
| **design-tokens-visual-reference.html** | Visual mockup of all design tokens (open in browser) |

### Helpers (`helpers/`)

Utility scripts for productivity:

| Script | Purpose | Usage |
|--------|---------|-------|
| **add-block.sh** | Download blocks from Adobe repositories | `./helpers/add-block.sh <blockname> [boilerplate\|collection]` |

## Quick Start

### For Content Migration

1. **Read the workflow**: Start with `docs/EXCAT__AGENTIC_WORKFLOW.md`
2. **Use CLI tools**: See `docs/EXCAT__AEM_DA.md` for command reference
3. **Reference blocks**: Check `config/block-showcase.md` for markdown syntax

### For EDS Development

1. **Project setup**: Follow `docs/EXCAT__AEM_EDS.md`
2. **Design tokens**: Adapt your design system using `docs/EXCAT__DESIGN_TOKENS.md`
3. **Visual reference**: Open `config/design-tokens-visual-reference.html` in browser

### For Troubleshooting

1. **General debugging**: See `docs/EXCAT__DEBUGGING.md`
2. **Image issues**: Check `docs/EXCAT__IMAGE_TROUBLESHOOTING.md`
3. **Navigation problems**: Refer to `docs/NAVIGATION.md`

## Common Tasks

### Install a Block from Adobe Repository

```bash
# Install from boilerplate (default)
./helpers/add-block.sh quote

# Install from block collection
./helpers/add-block.sh breadcrumbs collection
```

### View Design Tokens

```bash
# Open visual reference in browser
open -a "Google Chrome" config/design-tokens-visual-reference.html
```

### Generate Block from Web Page

Follow the automated workflow in `docs/EXCAT__AUTOMATED_BLOCK_GENERATION.md`:
1. Visual layout analysis (count items per row!)
2. Screenshot capture
3. Block implementation with proper CSS
4. Test-verify-refine loop

## Integration with CLAUDE.md

This toolkit is designed to work with Claude Code. The root `CLAUDE.md` file references these documents as startup files, providing context for AI-assisted development.

**Key integration points:**
- Workflow automation for content migration
- Block generation and customization
- Design system adaptation
- Troubleshooting and debugging

## Documentation Conventions

### File Naming

- **EXCAT__** prefix: Core documentation files
- **Uppercase**: Major reference documents
- **lowercase**: Helper files and examples

### When to Reference

- **Before migration**: Read workflow and DA interaction docs
- **During development**: Reference EDS guidelines and design tokens
- **When blocked**: Use debugging and troubleshooting guides
- **For examples**: Check block showcase and visual references

## Support and Resources

- [AEM Edge Delivery Documentation](https://www.aem.live/docs/)
- [Developer Tutorial](https://www.aem.live/developer/tutorial)
- [Adobe AEM Boilerplate](https://github.com/adobe/aem-boilerplate)
- [Adobe Block Collection](https://github.com/adobe/aem-block-collection)

## Contributing

When adding new documentation:
1. Place guides in `docs/`
2. Place reference materials in `config/`
3. Place scripts in `helpers/`
4. Update this README with new entries
5. Update `CLAUDE.md` if files should be auto-loaded

## License

Part of the Adobe Experience Manager Edge Delivery Services ecosystem.
