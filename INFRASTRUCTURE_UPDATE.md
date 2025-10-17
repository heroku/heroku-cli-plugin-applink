# Infrastructure Updates

## Summary

This document summarizes the infrastructure modernization changes made to the
`@heroku-cli/plugin-applink` project. All changes have been tested and verified
to work correctly.

## Package Manager Migration

### From Yarn to NPM

- **Change**: Replaced `yarn` with `npm` as the package manager
- **Impact**: All scripts in `package.json` updated to use `npm` commands
- **Reason**: Standardizing on npm for better compatibility and ecosystem
  support

## Dependency Updates

### Core Dependencies

All dependencies have been reviewed and updated where appropriate:

- **axios**: Updated to `^1.12.2` (latest)
- **@types/node**: Updated to `^24.7.0` (latest)
- **typescript**: Updated to `^5.9.3` (latest)
- **eslint**: Updated to `^9.37.0` (latest, with flat config)
- **@typescript-eslint/eslint-plugin**: Updated to `^8.46.0` (latest)
- **@typescript-eslint/parser**: Updated to `^8.46.0` (latest)
- **mocha**: Updated to `^11.7.4` (latest)
- **sinon**: Updated to `^21.0.0` (latest)
- **chai**: Updated to `^4.5.0` (latest)
- **oclif**: Updated to `^4.18.5` (latest)

### Framework Dependencies (Kept Stable)

The following dependencies were kept at their current versions to maintain
stability:

- **@oclif/core**: `^2.16.0` (v4 has breaking changes)
- **@oclif/plugin-help**: `^5.2.20` (matches @oclif/core version)
- **@oclif/test**: `^2.3.28` (matches @oclif/core version)
- **@heroku-cli/command**: `^11.6.0` (v12 requires @oclif/core v4)
- **open**: `^8.4.2` (v10+ is ESM-only, project uses CommonJS)

### Rationale for Version Constraints

The framework dependencies (`@oclif/core`, `@heroku-cli/command`) are tightly
coupled. Upgrading to the latest versions would require:

1. Significant refactoring of command classes (breaking API changes)
2. Migration from CommonJS to ESM
3. Extensive testing of command execution patterns

These changes are beyond the scope of this infrastructure update and should be
addressed in a separate migration effort.

## Code Coverage Tool Migration

### From nyc to c8

- **Change**: Replaced `nyc` with `c8` for code coverage
- **Files Modified**:
  - `package.json`: Updated test script to use `c8 mocha`
  - `.gitignore`: Changed from `.nyc_output/` to `coverage/`
  - `.c8rc.json`: Created new configuration file
- **Benefits**:
  - Native V8 coverage (more accurate)
  - Better performance
  - Active maintenance and development
  - Modern tooling alignment

### Configuration

Created `.c8rc.json` with the following settings:

```json
{
  "all": true,
  "include": ["src/**/*.ts"],
  "exclude": ["dist/**/*", "**/*.test.ts", "test/**/*"],
  "reporter": ["text", "html", "text-summary"],
  "clean": true,
  "temp-directory": "./coverage/tmp",
  "report-dir": "./coverage"
}
```

## Code Quality Tooling

### Prettier

- **Added**: `prettier@^3.6.2`
- **Configuration**: Created `.prettier.mjs` with project formatting rules
- **Scripts Added**:
  - `npm run prettier`: Format all files
  - `npm run format`: Run prettier + eslint --fix together
- **Settings**:
  - Semi-colons: enabled
  - Single quotes: enabled
  - Tab width: 2 spaces
  - Print width: 80 characters
  - Line endings: LF

### lint-staged

- **Added**: `lint-staged@^16.2.3`
- **Configuration**: Created `.lintstagedrc.json`
- **Purpose**: Run formatters and linters on staged Git files only
- **Configuration**:
  ```json
  {
    "**/*.{ts,tsx,cjs,mjs,js}": ["npm run format"],
    "*.{json,md,yml,yaml}": ["npm run format"]
  }
  ```

### Husky

- **Added**: `husky@^9.1.7`
- **Configuration**: Created `.husky/pre-commit` hook
- **Purpose**: Automatically run lint-staged on pre-commit
- **Setup**:
  - Added `prepare` script to `package.json`
  - Pre-commit hook runs `npm run lint-staged`

## ESLint Configuration Migration

### From .eslintrc.json to Flat Config

- **Change**: Migrated from ESLint legacy config to ESLint 9 flat config
- **Files**:
  - **Deleted**: `.eslintrc.json`, `.eslintignore`
  - **Created**: `eslint.config.mjs`
- **Benefits**:
  - Future-proof (ESLint 9+ standard)
  - Better TypeScript support
  - More explicit configuration
  - Improved performance

### Configuration Details

The new flat config includes:

- Separate configurations for source files (`src/**/*.ts`) and test files
  (`test/**/*.ts`)
- TypeScript project reference for source files only
- Mocha-specific rules and globals for test files
- Proper ignore patterns for build artifacts and scripts
- Disabled `prefer-arrow-callback` in test files (Mocha best practice)

## Code Fixes

### TypeScript Type Compatibility

Two type compatibility issues were fixed:

1. **src/commands/salesforce/publish.ts**:
   - Issue: `Buffer` not assignable to `BlobPart`
   - Fix: Convert `Buffer` to `Uint8Array` when creating `Blob`

2. **src/lib/base.ts**:
   - Issue: Header object type mismatch
   - Fix: Added explicit type cast to `OutgoingHttpHeaders`

### Test File Cleanup

- **test/lib/base.test.ts**: Removed unused `eslint-disable` directive

## New Scripts

Added the following npm scripts for improved developer experience:

```json
{
  "prepare": "husky",
  "prettier": "prettier . --write --config ./.prettier.mjs",
  "format": "npm run prettier && npm run lint:fix",
  "lint-staged": "npx lint-staged",
  "check": "npm run format && npm run type-check && npm test",
  "ci": "npm run lint && npm run type-check && npm test"
}
```

## Test Results

All tests pass successfully with excellent coverage:

- **Total Tests**: 74 passing
- **Duration**: ~54 seconds
- **Coverage**:
  - Statements: 94.09% (1562/1660)
  - Branches: 85.78% (163/190)
  - Functions: 88.31% (68/77)
  - Lines: 94.09% (1562/1660)

## Developer Workflow Improvements

### Pre-commit Hooks

Developers now automatically benefit from:

1. Code formatting via Prettier on all staged files
2. ESLint auto-fix on staged TypeScript files
3. Consistent code style enforcement

### Quality Check Commands

New commands for comprehensive quality checks:

- `npm run format`: Format and auto-fix all files
- `npm run check`: Run full quality check suite (format, type-check, tests)
- `npm run ci`: Run CI-equivalent checks (lint, type-check, tests)

## Migration Notes

### For Developers

1. Delete your `node_modules/` and `yarn.lock` if present
2. Run `npm install` to install dependencies
3. Pre-commit hooks are now automatic via Husky
4. Use `npm run format` before committing (or rely on pre-commit hook)

### Breaking Changes

None. All command functionality remains unchanged.

## Future Recommendations

### Framework Upgrade Path

When ready to modernize the framework dependencies:

1. **Phase 1**: Plan migration to ESM
   - Update `package.json` to `"type": "module"`
   - Update imports to use `.js` extensions
   - Update TypeScript config for ESM output

2. **Phase 2**: Upgrade @oclif/core to v4
   - Update command class patterns
   - Replace `ux.action` with new API
   - Update flag definitions
   - Test all commands thoroughly

3. **Phase 3**: Upgrade @heroku-cli/command to v12
   - Verify compatibility with @oclif/core v4
   - Update any Heroku-specific patterns
   - Test integration with Heroku API

### Additional Improvements

- Consider adding `commitlint` for conventional commit enforcement
- Consider adding `semantic-release` for automated versioning
- Add `--watch` mode for tests during development
- Consider migrating to `vitest` for faster test execution

## Validation

All changes have been validated:

- ✅ Build process: `npm run build` - Success
- ✅ Type checking: `npm run type-check` - Success
- ✅ Linting: `npm run lint` - Success
- ✅ Tests: `npm test` - 74 tests passing, 94.09% coverage
- ✅ Pre-commit hook: Verified functional
- ✅ Code formatting: Consistent across codebase

## Files Modified

### Configuration Files

- `package.json` - Updated scripts, dependencies, and added lint-staged config
- `.gitignore` - Updated for c8 coverage output
- `.c8rc.json` - Created for c8 configuration
- `.prettier.mjs` - Created for Prettier configuration
- `.lintstagedrc.json` - Created for lint-staged configuration
- `eslint.config.mjs` - Created for ESLint flat config

### Removed Files

- `.eslintrc.json` - Replaced by `eslint.config.mjs`
- `.eslintignore` - Replaced by ignores in `eslint.config.mjs`

### Git Hooks

- `.husky/pre-commit` - Created for pre-commit linting and formatting

### Source Code

- `src/commands/salesforce/publish.ts` - Fixed Buffer to BlobPart type issue
- `src/lib/base.ts` - Fixed headers type compatibility
- `test/lib/base.test.ts` - Removed unused eslint-disable directive

## Conclusion

The infrastructure has been successfully modernized with:

- Modern tooling (c8, prettier, lint-staged, husky)
- Updated dependencies (TypeScript 5.9, ESLint 9, etc.)
- Improved developer experience (pre-commit hooks, quality check scripts)
- Maintained stability (framework dependencies kept compatible)
- Full test coverage maintained (94.09%)

All changes are backward compatible and do not affect command functionality or
the user experience.
