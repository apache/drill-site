---
title: "Druid Storage Plugin"
slug: "Druid Storage Plugin"
parent: "Connect a Data Source"
---

**Introduced in release:** 1.18

The Druid storage plugin allows you to perform SQL queries against [Apache Druid](https://druid.apache.org/) data sources.

### Tested Druid versions

[0.22.0](https://github.com/apache/druid/releases/tag/druid-0.22.0)

## Configuration

The plugin can be registered in Apache Drill using the drill web interface by navigating to the ```storage``` page.  

### Configuration Options

|---------------------|-----------------------|-------------------------------------------|
| Option              | Default               | Description                               |
|---------------------|-----------------------|-------------------------------------------|
| type                | (none)                | Set to "Druid" to make use of this plugin |
| brokerAddress       | http://localhost:8082 | Web address of the Druid broker           |
| coordinatorAddress  | http://localhost:8081 | Web address of the Druid coodinator       |
| averageRowSizeBytes | 100                   |                                           |
| enabled             | false                 | Set to true to enable this storage plugin |
|---------------------|-----------------------|-------------------------------------------|

### Example Configuration

    {
      "type" : "Druid",
      "brokerAddress" : "http://localhost:8082",
      "coordinatorAddress": "http://localhost:8081",
      "averageRowSizeBytes": 100,
      "enabled" : false
    }

## Usage Notes

### Druid API

Druid supports multiple native queries to address sundry use-cases. To fetch raw Druid rows, Druid's API support two forms of query, [Select](https://druid.apache.org/docs/latest/querying/select-query.html) (no relation to SQL) and [Scan](https://druid.apache.org/docs/latest/querying/scan-query.html). In Drill 1.18 and 1.19, this plugin used the Select query API to fetch raw rows from Druid as json. Since Drill 1.20, this plugin uses the Scan query API and can communicate with Druid Version >= 0.20.x .

### Filter Push-Down

Filters are pushed down to native Druid filter structure, converting SQL where clauses to the respective Druid [Filters](https://druid.apache.org/docs/latest/querying/filters.html).

