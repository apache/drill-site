---
title: "SAS Format Plugin"
slug: "SAS Format Plugin"
parent: "Data Sources and File Formats"
---

**Introduced in release:** 1.20

This format plugin enables Drill to read SAS files (sas7bdat).  The schema of the queried data is inferred from the metadata in the SAS file format.

## Configuration Options
This function has no configuration options other than the file extension.

```json
{
  "sas": {
  "type": "sas",
  "extensions": [
    "sas7bdat"
  ]
}
```

This plugin is enabled by default.

## Data Types
The SAS format supports the `VARCHAR`, `LONG`, `DOUBLE` and `DATE` types.

## Implicit Fields (Metadata)
The SAS reader provides the following file metadata fields:
* `_compression_method`
* `_encoding`
* `_file_label`
* `_file_type`
* `_os_name`
* `_os_type`
* `_sas_release`
* `_session_encoding`
* `_date_created`
* `_date_modified`

