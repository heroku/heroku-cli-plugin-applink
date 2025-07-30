# Heroku AppLink CLI Plugin Architecture

## Overview

The `@heroku-cli/plugin-applink` is a Heroku CLI plugin that facilitates connections between Heroku applications and external systems, specifically Salesforce Orgs and Data Cloud Orgs. The plugin provides a comprehensive set of commands for managing authorizations, connections, and data integrations.

## Project Information

- **Name**: @heroku-cli/plugin-applink
- **Version**: 1.0.1
- **Author**: Heroku
- **License**: Apache-2.0
- **Node.js Version**: >= 20

## Technical Stack

### Core Dependencies
- **oclif**: CLI framework for building command-line applications
- **@heroku-cli/command**: Heroku CLI command framework
- **@heroku-cli/color**: Color utilities for CLI output
- **@heroku-cli/schema**: Heroku API schema definitions
- **axios**: HTTP client for API requests
- **adm-zip**: ZIP file handling for publishing operations
- **open**: Browser opening utility for OAuth flows

### Development Dependencies
- **TypeScript**: Primary development language
- **Mocha**: Testing framework
- **NYC**: Code coverage tool
- **ESLint**: Code linting and formatting

## Architecture Components

### 1. Base Command Class (`src/lib/base.ts`)

The foundation of all commands, providing:
- **AppLink API Client Configuration**: Manages connection to the AppLink service
- **Add-on Resolution**: Handles multiple AppLink add-ons per app
- **Authentication**: Manages SSO tokens and authorization headers
- **Error Handling**: Standardized error messages and exit codes

Key features:
- Automatic add-on discovery and validation
- SSO token management with base64 encoding
- Custom API client configuration with proper headers

### 2. Type System (`src/lib/applink/types.ts` & `src/lib/types.ts`)

Comprehensive TypeScript definitions for:
- **Connection Types**: `SalesforceConnection`, `DataCloudConnection`
- **Organization Models**: `BaseOrg`, `AuthorizationOrg`, `ConnectionOrg`
- **Status Enums**: Connection and authorization status tracking
- **API Response Models**: `AppPublish`, `DataActionTargetCreate`, `Publication`

### 3. Utilities (`src/lib/helpers.ts`)

Helper functions for:
- **Text Formatting**: `humanize()` function for user-friendly text display
- **Object Transformation**: `humanizeKeys()` for converting API responses

### 4. Command Structure

Commands are organized into three main topics:

#### AppLink Commands (`applink:*`)
- `applink:authorizations` - List authorized users
- `applink:authorizations:info` - Show authorization details
- `applink:connections` - List connections
- `applink:connections:info` - Show connection details

#### Salesforce Commands (`salesforce:*`)
- `salesforce:authorizations:add` - Store user credentials
- `salesforce:authorizations:remove` - Remove authorization
- `salesforce:connect` - Connect Salesforce org via OAuth
- `salesforce:connect:jwt` - Connect using JWT authentication
- `salesforce:disconnect` - Disconnect Salesforce org
- `salesforce:publications` - List published apps
- `salesforce:publish` - Publish API specification

#### Data Cloud Commands (`datacloud:*`)
- `datacloud:authorizations:add` - Store Data Cloud credentials
- `datacloud:authorizations:remove` - Remove Data Cloud authorization
- `datacloud:connect` - Connect Data Cloud org
- `datacloud:disconnect` - Disconnect Data Cloud org
- `datacloud:data-action-target:create` - Create data action targets

## CLI Commands Reference

### General Command Structure

All commands follow this pattern:
```bash
heroku <topic>:<command> [ARGS] [FLAGS]
```

### Common Flags
- `-a, --app=<value>` - Target Heroku app (required)
- `-r, --remote=<value>` - Git remote of app to use
- `--addon=<value>` - Specific AppLink add-on name or ID

### Authorization Management

#### Add Salesforce Authorization
```bash
heroku salesforce:authorizations:add DEVELOPER_NAME -a <app>
```
- Opens OAuth flow in browser
- Stores user credentials for later connection use
- Supports custom login URLs and browser selection

#### Add Data Cloud Authorization  
```bash
heroku datacloud:authorizations:add DEVELOPER_NAME -a <app>
```
- Similar to Salesforce but for Data Cloud orgs
- Validates developer name format (3-30 chars, alphanumeric + underscores)

#### Remove Authorizations
```bash
heroku salesforce:authorizations:remove DEVELOPER_NAME -a <app>
heroku datacloud:authorizations:remove DEVELOPER_NAME -a <app>
```
- Confirms deletion to prevent accidental removal
- Bypassed with `-c, --confirm=<developer_name>` flag

### Connection Management

#### Connect Organizations
```bash
heroku salesforce:connect CONNECTION_NAME -a <app>
heroku datacloud:connect CONNECTION_NAME -a <app>
```
- Creates persistent connection between Heroku app and external org
- Supports real-time status polling during connection process
- Opens OAuth flow for user authentication

#### JWT-based Salesforce Connection
```bash
heroku salesforce:connect:jwt CONNECTION_NAME -a <app> --client-id <id> --jwt-key-file <path> --username <user>
```
- Server-to-server authentication using JWT tokens
- Requires pre-configured Connected App in Salesforce
- Suitable for automated/headless environments

#### Disconnect Organizations
```bash
heroku salesforce:disconnect CONNECTION_NAME -a <app>
heroku datacloud:disconnect CONNECTION_NAME -a <app>
```
- Safely terminates org connections
- Confirmation required to prevent accidental disconnection

### Information Commands

#### List Connections
```bash
heroku applink:connections -a <app>
```
- Shows all connections with status and type
- Color-coded status indicators (red for failed)
- Includes troubleshooting guidance for failed connections

#### List Authorizations
```bash
heroku applink:authorizations -a <app>
```
- Displays all stored user authorizations
- Shows creation timestamps and status

#### View Connection Details
```bash
heroku applink:connections:info CONNECTION_NAME -a <app>
```
- Detailed connection information
- Error messages and troubleshooting info

### Publishing and Integration

#### Publish API Specification
```bash
heroku salesforce:publish API_SPEC_FILE_DIR -a <app> -c <client_name> --connection-name <name>
```
- Publishes OpenAPI 3.x specifications to Salesforce
- Creates Connected Apps and Permission Sets
- Supports custom metadata directories
- Handles both JSON and YAML formats

#### List Publications
```bash
heroku salesforce:publications -a <app>
```
- Shows which Salesforce orgs have the app published
- Filterable by connection name

#### Create Data Action Targets
```bash
heroku datacloud:data-action-target:create LABEL -a <app> -o <connection> -p <api_path>
```
- Creates webhook endpoints in Data Cloud
- Configures data action targets for real-time data processing
- Supports custom API names and paths

## Data Flow Architecture

### Authentication Flow
1. **Add-on Validation**: Verify AppLink add-on exists and is provisioned
2. **SSO Token Retrieval**: Get add-on SSO token from Heroku API
3. **API Client Configuration**: Set up authenticated client with proper headers
4. **Request Authorization**: Use Bearer token for all AppLink API calls

### Connection Flow
1. **OAuth Initiation**: Create connection request and get redirect URI
2. **Browser Opening**: Launch OAuth flow in user's browser
3. **Status Polling**: Monitor connection status with 5-second intervals
4. **Completion Handling**: Display success/failure status

### Publishing Flow
1. **File Validation**: Verify OpenAPI specification format
2. **Metadata Collection**: Gather additional metadata files if specified
3. **ZIP Archive Creation**: Package all files for upload
4. **Multipart Upload**: Send files to Salesforce via AppLink API
5. **Status Feedback**: Report publishing success/failure

## External Integrations

### Heroku Platform API
- App information retrieval
- Add-on management and validation
- Configuration variable access
- SSO token generation

### AppLink Service API
- Primary backend service for all operations
- RESTful API with JWT authentication
- Real-time status updates
- File upload capabilities

### Salesforce/Data Cloud APIs
- OAuth authentication flows
- Metadata deployment
- Connection validation
- API specification publishing

## Error Handling Strategy

### Validation Errors
- Add-on existence and provisioning status
- Connection name format validation
- File format verification

### Network Errors
- Retry logic for transient failures
- Detailed error messages with troubleshooting steps
- Graceful degradation for offline scenarios

### User Experience
- Colored output for status indication
- Progress indicators for long-running operations
- Confirmation prompts for destructive operations

## Testing Strategy

### Unit Tests
- Command parsing and validation
- Error handling scenarios
- Mock external API calls

### Integration Tests
- End-to-end command execution
- API client configuration
- File handling operations

### Coverage
- NYC for code coverage tracking
- Mocha for test execution
- Nock for HTTP mocking

## Project Structure

```
src/
├── commands/                 # CLI commands organized by topic
│   ├── applink/             # General AppLink commands
│   │   ├── authorizations/  # Authorization management
│   │   └── connections/     # Connection management
│   ├── salesforce/          # Salesforce-specific commands
│   │   ├── authorizations/  # SF authorization management
│   │   └── connect/         # SF connection commands
│   └── datacloud/           # Data Cloud commands
│       ├── authorizations/  # DC authorization management
│       └── data-action-target/ # DC data action targets
├── lib/                     # Shared libraries
│   ├── applink/            # AppLink-specific types and utilities
│   ├── base.ts             # Base command class
│   ├── types.ts            # Global type definitions
│   ├── helpers.ts          # Utility functions
│   └── confirmCommand.ts   # Confirmation dialog utilities
└── index.ts                # Plugin entry point

test/                        # Test files mirroring src structure
├── commands/               # Command tests
├── lib/                    # Library tests
└── helpers/                # Test utilities

dist/                       # Compiled TypeScript output
```

## Build and Development

### Scripts
- `yarn build` - Compile TypeScript and generate manifest
- `yarn test` - Run test suite with coverage
- `yarn lint` - ESLint code checking
- `yarn version` - Update version and regenerate README

### Configuration Files
- `tsconfig.json` - TypeScript compilation settings
- `.eslintrc.json` - Code style and quality rules
- `.mocharc.json` - Test runner configuration
- `.nycrc.json` - Coverage reporting settings

## Plugin Installation and Usage

### Installation
```bash
heroku plugins:install @heroku-cli/plugin-applink
```

### Prerequisites
- Heroku CLI installed
- AppLink add-on provisioned on target app
- Valid Heroku app with appropriate permissions

### Basic Workflow
1. Install AppLink add-on: `heroku addons:create heroku-applink -a <app>`
2. Add authorization: `heroku salesforce:authorizations:add <dev_name> -a <app>`
3. Create connection: `heroku salesforce:connect <connection_name> -a <app>`
4. Publish API: `heroku salesforce:publish <spec_file> -a <app> -c <client> --connection-name <name>`

This architecture provides a robust, extensible foundation for managing Heroku-to-external-system integrations with comprehensive CLI tooling. 