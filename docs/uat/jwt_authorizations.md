# Manual Testing: JWT Authorizations

## Overview

This document covers testing JWT authorization commands for both Salesforce and
Data Cloud orgs. The commands use identical syntax - simply replace `salesforce`
with `datacloud` in the command name.

## Prerequisites

### Installing the new commands

Clone and link the applink plugin from your local repository to test the new
commands:

```bash
# Clone the main branch of the repository
git clone git@github.com:heroku/heroku-cli-plugin-applink.git

# Navigate to the plugin directory
cd heroku-cli-plugin-applink

# Install dependencies
npm install

# Build the plugin (compiles TypeScript)
npm run build

# Link the plugin to Heroku CLI
heroku plugins:link .
```

### To test the full command flow:

1. A Heroku app with the AppLink add-on provisioned
2. A Salesforce or Data Cloud Connected App with JWT Bearer Flow enabled
3. The Connected App's Consumer Key (Client ID)
4. A private key file (`.key` file) that matches the certificate uploaded to the
   Connected App
5. A Salesforce/Data Cloud username authorized in the Connected App

## Test scenarios

> **Note**: All test scenarios below use `salesforce:authorizations:add:jwt`. To
> test Datacloud, replace `salesforce` with `datacloud` in any command.

### Test Scenario 1: Basic JWT Authorization (Production Org)

```bash
heroku salesforce:authorizations:add:jwt my_jwt_auth_1 \
  --app YOUR_APP_NAME \
  --client-id YOUR_CONSUMER_KEY \
  --jwt-key-file /path/to/your/server.key \
  --username your.salesforce.user@company.com
```

**Expected Output:**

```
Adding credentials for your.salesforce.user@company.com to YOUR_APP_NAME as my_jwt_auth_1... Authorized
```

### Test Scenario 2: Sandbox JWT Authorization

```bash
heroku salesforce:authorizations:add:jwt my_sandbox_auth \
  --app YOUR_APP_NAME \
  --client-id YOUR_CONSUMER_KEY \
  --jwt-key-file /path/to/your/server.key \
  --username your.salesforce.user@company.com.sandbox \
  --login-url https://test.salesforce.com
```

### Test Scenario 3: JWT Authorization with Custom Alias

```bash
heroku salesforce:authorizations:add:jwt my_jwt_auth_2 \
  --app YOUR_APP_NAME \
  --client-id YOUR_CONSUMER_KEY \
  --jwt-key-file /path/to/your/server.key \
  --username your.salesforce.user@company.com \
  --alias production-api-user
```

### Test Scenario 4: Multiple AppLink Add-ons (specify add-on)

```bash
heroku salesforce:authorizations:add:jwt my_jwt_auth_3 \
  --app YOUR_APP_NAME \
  --addon heroku-applink-12345 \
  --client-id YOUR_CONSUMER_KEY \
  --jwt-key-file /path/to/your/server.key \
  --username your.salesforce.user@company.com
```

## 🔍 Verification Commands

### 1. List All Authorizations

```bash
heroku applink:authorizations --app YOUR_APP_NAME
```

**What to verify:**

- Your new authorization appears in the list
- `connection_method` column shows as "JWT"
- `status` column shows as "authorized"
- `developerName` (or Developer Name) matches what you specified

### 2. Get Specific Authorization Details

```bash
heroku applink:authorizations:info my_jwt_auth_1 --app YOUR_APP_NAME
```

**What to verify:**

- All fields are populated correctly
- `username` matches your Salesforce username
- `org.instance_url` points to your Salesforce org
- No error messages present

### 3. View Config Vars (if applicable)

```bash
heroku config --app YOUR_APP_NAME | grep APPLINK
```

## ❌ Error Scenario Testing

### Test Invalid Developer Name

```bash
# Too short (less than 3 chars)
heroku salesforce:authorizations:add:jwt ab \
  --app YOUR_APP_NAME \
  --client-id YOUR_CONSUMER_KEY \
  --jwt-key-file /path/to/your/server.key \
  --username your.user@company.com

# Invalid characters
heroku salesforce:authorizations:add:jwt my-auth-name \
  --app YOUR_APP_NAME \
  --client-id YOUR_CONSUMER_KEY \
  --jwt-key-file /path/to/your/server.key \
  --username your.user@company.com

# Consecutive underscores
heroku salesforce:authorizations:add:jwt my__auth \
  --app YOUR_APP_NAME \
  --client-id YOUR_CONSUMER_KEY \
  --jwt-key-file /path/to/your/server.key \
  --username your.user@company.com
```

### Test Missing Key File

```bash
heroku salesforce:authorizations:add:jwt my_jwt_auth_4 \
  --app YOUR_APP_NAME \
  --client-id YOUR_CONSUMER_KEY \
  --jwt-key-file /path/to/nonexistent.key \
  --username your.user@company.com
```

### Test Invalid Credentials

```bash
# Wrong client ID
heroku salesforce:authorizations:add:jwt my_jwt_auth_5 \
  --app YOUR_APP_NAME \
  --client-id INVALID_CLIENT_ID \
  --jwt-key-file /path/to/your/server.key \
  --username your.user@company.com
```

## 🧹 Cleanup Commands

### Remove Test Authorization

**Salesforce:**

```bash
heroku salesforce:authorizations:remove my_jwt_auth_1 \
  --app YOUR_APP_NAME \
  --confirm my_jwt_auth_1
```

**Data Cloud:**

```bash
heroku datacloud:authorizations:remove my_jwt_auth_1 \
  --app YOUR_APP_NAME \
  --confirm my_jwt_auth_1
```

### Unlink the plugin when done testing:

```bash
heroku plugins:unlink @heroku/heroku-cli-plugin-applink
```

## Troubleshooting

### Add the debug flag to the command to see full error details

```bash
heroku salesforce:authorizations:add:jwt my_jwt_auth --debug ...
```
