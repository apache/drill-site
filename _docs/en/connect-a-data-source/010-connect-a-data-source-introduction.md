---
title: "Connect a Data Source Introduction"
slug: "Connect a Data Source Introduction"
parent: "Connect a Data Source"
---
Drill includes several storage plugins than you can configure for your environment. A storage plugin is a software module for connecting Drill to data sources, such as databases and local or distributed file systems. A storage plugin typically optimizes Drill queries, provides the location of the data, and stores the workspace and file formats for reading data. Storage plugins also perform scanner and writer functions and inform the execution engine of any native capabilities, such as predicate pushdown, joins, and SQL. You can modify the default storage plugin configurations or add new storage plugin configurations to connect to your data sources. 

When you run a query, Drill gets the storage plugin configuration name in one of several ways:

* The FROM clause of the query can identify the plugin to use.
* The USE <plugin name> command can precede the query.
* You can specify the storage plugin when starting Drill.

As a general principle, Drill aims to make storage plugins lazy about connecting to external data sources.  This means that you should normally be able to add and enable a storage configuration based on some external data source even if that data source is not available to accept queries at the time.  Another consequence of lazy connecting is that Drill restarts, which reload all enabled storage plugins, will not kick a configuration into the disabled state if the corresponding external data source is not available at the time.

A related principle is that Drill storage plugins should aim, by default, to be thrifty about how many connections they make and maintain for the following reasons.

- Each Drillbit participating in a query involving an external data source must initiate its own outbound connection(s).
- In the OLAP regime, the cost of bringing up a new connection is typically negligible compared to the total cost of an analytical query.
