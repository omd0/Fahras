# Organization Configuration Guide

This document explains how to use the `organization-config.yml` file across the Fahras project.

## Overview

The `organization-config.yml` file serves as a **single source of truth** for all organization branding, contact information, URLs, and configuration values used throughout the project. This ensures consistency across:

- Frontend (React/TypeScript)
- Backend (Laravel/PHP)
- Documentation
- CI/CD pipelines
- Docker configurations
- Email templates
- API responses

## File Structure

The configuration file is organized into the following sections:

- **organization**: Organization details (Fahras-Org)
- **project**: Project information (Fahras)
- **branding**: Visual identity, colors, logos
- **contact**: Contact information
- **urls**: All application and service URLs
- **cicd**: CI/CD and Forgejo configuration
- **app**: Application-specific settings
- **legal**: Legal and compliance information
- **metadata**: SEO and metadata
- **features**: Feature flags

## Usage Examples

### Frontend (React/TypeScript)

#### Option 1: Load YAML directly (Recommended)

```typescript
// src/config/organization.ts
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), '../../organization-config.yml');
const configFile = fs.readFileSync(configPath, 'utf8');
export const orgConfig = yaml.load(configFile) as any;

// Usage in components
import { orgConfig } from '@/config/organization';

const OrganizationName = () => (
  <h1>{orgConfig.organization.display_name.en}</h1>
);
```

#### Option 2: Convert to TypeScript constants

```typescript
// src/config/organization.ts
export const ORGANIZATION = {
  NAME: 'Fahras-Org',
  DISPLAY_NAME: {
    EN: 'Fahras Organization',
    AR: 'منظمة فهرس'
  },
  DESCRIPTION: {
    EN: 'Fahras Project Organization',
    AR: 'منظمة مشروع الفهرس'
  }
} as const;

export const PROJECT = {
  NAME: 'Fahras',
  DESCRIPTION: {
    EN: 'Project Management System',
    AR: 'نظام إدارة المشاريع'
  }
} as const;
```

### Backend (Laravel/PHP)

#### Option 1: Use Symfony YAML component

```php
// config/organization.php
use Symfony\Component\Yaml\Yaml;

$configPath = base_path('../organization-config.yml');
$config = Yaml::parseFile($configPath);

return [
    'organization' => [
        'name' => $config['organization']['name'],
        'display_name' => $config['organization']['display_name'],
        'description' => $config['organization']['description'],
    ],
    'project' => [
        'name' => $config['project']['name'],
        'description' => $config['project']['description'],
    ],
    // ... more config
];
```

#### Option 2: Generate .env values

Create a script to extract values from YAML to `.env`:

```php
// scripts/generate-env-from-config.php
use Symfony\Component\Yaml\Yaml;

$config = Yaml::parseFile(__DIR__ . '/../organization-config.yml');

$envContent = "APP_NAME=\"{$config['app']['name']}\"\n";
$envContent .= "APP_URL=\"{$config['urls']['app']['development']}\"\n";
$envContent .= "MAIL_FROM_ADDRESS=\"{$config['app']['email']['from_address']}\"\n";
$envContent .= "MAIL_FROM_NAME=\"{$config['app']['email']['from_name']}\"\n";

file_put_contents(__DIR__ . '/../api/.env', $envContent, FILE_APPEND);
```

### CI/CD (GitHub Actions / Forgejo Actions)

```yaml
# .forgejo/workflows/example.yml
name: Example Workflow

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Load Organization Config
        id: config
        run: |
          # Install yq (YAML processor)
          sudo wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64
          sudo chmod +x /usr/local/bin/yq
          
          # Extract values
          ORG_NAME=$(yq eval '.organization.name' organization-config.yml)
          PROJECT_NAME=$(yq eval '.project.name' organization-config.yml)
          
          echo "org_name=$ORG_NAME" >> $GITHUB_OUTPUT
          echo "project_name=$PROJECT_NAME" >> $GITHUB_OUTPUT
      
      - name: Use Config Values
        run: |
          echo "Building ${{ steps.config.outputs.project_name }} for ${{ steps.config.outputs.org_name }}"
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    image: ${FORGEJO_REGISTRY}/fahras-org/fahras-api:latest
    environment:
      - APP_NAME=Fahras
      - APP_URL=http://localhost:8000
    # ... more config
```

You can use a script to inject values from `organization-config.yml`:

```bash
#!/bin/bash
# scripts/inject-config-to-docker.sh

ORG_NAME=$(yq eval '.organization.name' organization-config.yml)
PROJECT_NAME=$(yq eval '.project.name' organization-config.yml)

export ORG_NAME
export PROJECT_NAME

docker-compose up -d
```

### Documentation

Reference the config in documentation:

```markdown
# Project Information

- **Organization**: {{ organization.name }}
- **Project**: {{ project.name }}
- **Description**: {{ project.description.en }}

For full configuration, see [organization-config.yml](../organization-config.yml)
```

## Integration Steps

### 1. Install YAML Parser (if needed)

**Node.js/TypeScript:**
```bash
npm install js-yaml @types/js-yaml
```

**PHP/Laravel:**
```bash
composer require symfony/yaml
```

**Python (for scripts):**
```bash
pip install pyyaml
```

**Command Line (yq):**
```bash
# Linux
wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
chmod +x /usr/local/bin/yq

# macOS
brew install yq
```

### 2. Create Configuration Loaders

Create utility functions/modules to load and access the configuration:

- `web/src/config/organization.ts` - Frontend config loader
- `api/config/organization.php` - Backend config loader
- `scripts/load-config.sh` - Shell script helper

### 3. Update Existing Code

Replace hardcoded values with references to the config:

**Before:**
```typescript
const orgName = "Fahras-Org";
const projectName = "Fahras";
```

**After:**
```typescript
import { orgConfig } from '@/config/organization';
const orgName = orgConfig.organization.name;
const projectName = orgConfig.project.name;
```

### 4. Update Environment Files

Generate `.env` values from the config or reference the config directly.

### 5. Update CI/CD Workflows

Use the config in workflow files for consistent naming and URLs.

## Best Practices

1. **Never hardcode** organization/project names - always reference the config
2. **Validate** the config file structure when loading
3. **Cache** the loaded config in production environments
4. **Version control** the config file - it's part of your project
5. **Document** any custom additions to the config structure
6. **Use TypeScript types** (if using TypeScript) for type safety

## TypeScript Types (Optional)

Create type definitions for better IDE support:

```typescript
// src/types/organization-config.ts
export interface OrganizationConfig {
  organization: {
    name: string;
    display_name: {
      en: string;
      ar: string;
    };
    description: {
      en: string;
      ar: string;
    };
    // ... more fields
  };
  project: {
    name: string;
    display_name: {
      en: string;
      ar: string;
    };
    // ... more fields
  };
  // ... more sections
}
```

## Updating the Configuration

When updating organization information:

1. Edit `organization-config.yml`
2. Update any generated files (if using code generation)
3. Clear caches (Laravel: `php artisan config:clear`)
4. Restart services if needed
5. Update documentation if structure changes

## Validation

Consider adding validation to ensure the config file is valid:

```bash
# Validate YAML syntax
yamllint organization-config.yml

# Or with yq
yq eval '.' organization-config.yml > /dev/null && echo "Valid YAML"
```

## Questions?

For questions or suggestions about the organization configuration, please refer to the project documentation or contact the development team.

