<a href="https://cognite.com/">
    <img src="./cognite_logo.png" alt="Cognite logo" title="Cognite" align="right" height="80" />
</a>

# Cognite JavaScript SDK

[![CD status](https://github.com/cognitedata/cognite-sdk-js/actions/workflows/release.yaml/badge.svg)](https://github.com/cognitedata/cognite-sdk-js/actions/workflows/release.yaml)
[![codecov](https://codecov.io/gh/cognitedata/cognite-sdk-js/branch/master/graph/badge.svg)](https://codecov.io/gh/cognitedata/cognite-sdk-js)

The Cognite JavaScript SDK provides convenient access to the [Cognite Data Fusion (CDF) API](https://doc.cognitedata.com/dev/) from applications written in client- or server-side JavaScript/TypeScript.

## 📦 Packages

This repository is organized as a monorepo containing multiple packages for different API versions and use cases:

| Package | Version | Description | Stability |
|---------|---------|-------------|-----------|
| [@cognite/sdk](./packages/stable/) | 10.0.0 | Production-ready SDK for stable CDF API | ✅ Stable |
| [@cognite/sdk-beta](./packages/beta/) | 6.0.0 | Beta version with experimental features | 🔄 Beta |
| [@cognite/sdk-alpha](./packages/alpha/) | 0.36.0 | Alpha version for cutting-edge features | ⚠️ Alpha |
| [@cognite/sdk-core](./packages/core/) | 5.0.0 | Core functionality and utilities | ✅ Stable |

## 🚀 Getting Started

### Quick Start

For most users, start with the stable SDK:

```bash
npm install @cognite/sdk
# or
yarn add @cognite/sdk
```

```typescript
import { CogniteClient } from '@cognite/sdk';

const client = new CogniteClient({
  appId: 'your-app-id',
  project: 'your-project',
  // Add authentication configuration
});

// Start using the API
const assets = await client.assets.list();
```

### API Versions

- **Stable API**: Use `@cognite/sdk` for production applications
- **Beta API**: Use `@cognite/sdk-beta` for testing new features
- **Alpha API**: Use `@cognite/sdk-alpha` for experimental features

See individual package READMEs for detailed documentation:
- [Stable SDK Documentation](./packages/stable/README.md)
- [Beta SDK Documentation](./packages/beta/README.md)

## 🔧 Features

### Core Capabilities
- **Asset Management** - Create, read, update, and delete assets
- **Time Series Data** - Handle time series and synthetic time series
- **File Management** - Upload, download, and manage files with multipart support
- **3D Visualization** - 3D models, nodes, revisions, and asset mappings
- **Events & Relationships** - Manage events and entity relationships
- **Raw Data** - Access to raw tables and rows
- **Sequences** - Handle sequence data
- **Security** - Groups and security categories

### Authentication
- **OIDC Support** - OpenID Connect authentication
- **MSAL Integration** - Microsoft Authentication Library support
- **Token Management** - Automatic token refresh and management

## 📚 Documentation

### Guides
- [Authentication Guide](./guides/authentication.md) - Complete authentication setup
- [Assets Guide](./guides/assets.md) - Working with assets
- [Files Guide](./guides/files.md) - File management
- [Relationships Guide](./guides/relationships.md) - Entity relationships
- [Sequences Guide](./guides/sequences.md) - Sequence data handling
- [Monorepo Guide](./guides/monorepo.md) - Development setup

### Migration Guides
- [v1.x to v2.x Migration](./guides/MIGRATION_GUIDE_1xx_2xx.md)
- [v2.x to v3.x Migration](./guides/MIGRATION_GUIDE_2xx_3xx.md)
- [v9.x to v10.x Migration](./guides/MIGRATION_GUIDE_9xx_10xx.md)

## 🛠️ Samples

Explore working examples in the `samples/` directory:

- [Node.js OIDC TypeScript Sample](./samples/nodejs/oidc-typescript/) - Complete authentication example
- [Samples Overview](./samples/README.md) - Instructions for running samples

## 🔍 API Reference

### Response Metadata

Methods return only the response body. For HTTP status and headers, use `client.getMetadata`:

```typescript
const createdAsset = await client.assets.create([{ name: 'My first asset' }]);
const metadata = client.getMetadata(createdAsset);

console.log(metadata.header['Access-Control-Allow-Origin']);
console.log(metadata.status);
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Code style and standards
- Testing requirements
- Commit message conventions
- Automated versioning and releases

### Development Setup

```bash
# Clone and setup
git clone https://github.com/cognitedata/cognite-sdk-js.git
cd cognite-sdk-js
yarn install

# Build all packages
yarn build

# Run tests
yarn test

# Run linting
yarn lint
```

### Testing

Run the full test suite:

```bash
yarn test --since master
```

For integration tests, set these environment variables:
- `COGNITE_PROJECT`
- `COGNITE_BASE_URL`
- `COGNITE_CLIENT_SECRET`
- `COGNITE_CLIENT_ID`
- `COGNITE_AZURE_DOMAIN`

Set `REVISION_3D_INTEGRATION_TEST=true` for 3D revision tests.

**Note**: Some integration tests may be eventually consistent or skipped due to expensive API calls.

## 📋 Versioning

All packages follow [Semantic Versioning](https://semver.org/). Package versions are updated automatically based on commit messages.

## 📄 Changelogs

Each package maintains its own changelog:

- [@cognite/sdk](./packages/stable/CHANGELOG.md)
- [@cognite/sdk-beta](./packages/beta/CHANGELOG.md)
- [@cognite/sdk-core](./packages/core/CHANGELOG.md)
- [@cognite/sdk-alpha](./packages/alpha/CHANGELOG.md)

## 📄 License

[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/cognitedata/cognite-sdk-js/issues)
- **Documentation**: [Cognite Documentation](https://doc.cognitedata.com/dev/)
- **Community**: Reach out to contributors or create an issue

---

For questions or support, talk to any of the contributors or leave an issue and it'll get sorted.
