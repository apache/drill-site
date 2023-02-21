---
title: "Storage plugin authentication modes"
slug: "Storage plugin authentication modes"
parent: "Storage Plugin Configuration"
---
**Introduced in release: 1.21**

Drill 1.21 brings with it the ability to configure storage authentication modes on a per-plugin basis. Three authentication modes are provided but note that not every plugin need support every mode. Consult the respective plugin documentation page for information about the authentication modes that it supports.

## SHARED_USER
This is the default authentication mode for storage plugins and matches the authentication behaviour of storage plugins in previous versions of Drill. Drill connects to the storage using a single set of shared credentials stored in some credential provider. If no credentials are present, the plugin may connect with no credentials or make implicit use of the Drillbit's identity (e.g. OS process user). Authentication to the storage is unaffected by the Drill query user's identity.

## USER_TRANSLATION
{% include startnote.html %}At the present time, to use the USER_TRANSLATION authentication mode the global option `drill.exec.impersonation` must be set to true.{% include endnote.html %}

Drill connects to the storage using credentials looked up ("translated") for the Drill query user.  Authentication to the storage is a function of the Drill query user's identity (and that function may be 1-1 or *-1).

## USER_IMPERSONATION
This authentication mode is not yet implemented but is planned to replace the global option `drill.exec.impersonation`.

## Syntax
The authentication mode for a storage plugin is specified in its storage configuration usign the `authMode` property.
```
"authMode" : "SHARED_USER" | "USER_TRANSLATION" | "USER_IMPERSONATION"
```

## Credential Provider support for authentication modes
Every credential provider continues to support the default SHARED_USER mode in the same way that they did for previous versions of Drill. At the time of writing, the two credential providers that support USER_TRANSLATION are

1. the Plain credentials provider which stores a table of credentials alongside other storage configuration (with credentials configurable in the Drill web UI)
2. the Hashicorp Vault credentials provider which stores credentials at paths that can be looked up dynamically in Vault.

## SHARED_USER mode examples

### Using the Plain credentials provider

```json
{
  "type": "jdbc",
  "driver": "com.microsoft.sqlserver.jdbc.SQLServerDriver",
  "url": "jdbc:sqlserver://mssql.somewhere.com:1433;databaseName=test",
  "username": "sa",
  "password": "drowssap",
  "sourceParameters": {
    "minimumIdle": 0,
    "keepaliveTime": 60000,
    "idleTimeout": 300000,
    "maximumPoolSize": 5
  },
  "authMode": "SHARED_USER",
  "writerBatchSize": 10000,
  "enabled": true
}
```

### Using the Vault credentials provider

```json
{
  "type": "jdbc",
  "driver": "com.mysql.jdbc.Driver",
  "url": "jdbc:mysql://mysql.somewhere.com:3306",
  "sourceParameters": {
    "minimumIdle": 0,
    "keepaliveTime": 60000,
    "idleTimeout": 300000,
    "maximumPoolSize": 5,
    "registerMbeans": true
  },
  "credentialsProvider": {
    "credentialsProviderType": "VaultCredentialsProvider",
    "secretPath": "drill/credentials/orgUnit/dataSource-8",
    "propertyNames": {
      "username": "username",
      "password": "password"
    }
  },
  "authMode": "SHARED_USER",
  "writerBatchSize": 10000,
  "enabled": true
}
```

## USER_TRANSLATION Example

### Using the Vault crendentials provider
```json
{
  "type": "jdbc",
  "driver": "com.mysql.jdbc.Driver",
  "url": "jdbc:mysql://mysql.somewhere.com:3306",
  "sourceParameters": {
    "minimumIdle": 0,
    "keepaliveTime": 60000,
    "idleTimeout": 300000,
    "maximumPoolSize": 5,
    "registerMbeans": true
  },
  "credentialsProvider": {
    "credentialsProviderType": "VaultCredentialsProvider",
    "secretPath": "drill/credentials/orgUnit/alice/dataSource-436",
    "propertyNames": {
      "username": "username",
      "password": "password"
    }
  },
  "authMode": "USER_TRANSLATION",
  "writerBatchSize": 10000,
  "enabled": true
}
```
