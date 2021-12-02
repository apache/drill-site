---
title: "Mongo Metastore"
slug: "Mongo Metastore"
parent: "Drill Metastore"
---

**Introduced in release:** 1.20.

The Mongo Metastore implementation allows you store Drill Metastore metadata in a configured
 MongoDB.

## Configuration

Currently, the Mongo Metastore is not the default implementation.
To enable the Mongo Metastore create the `drill-metastore-override.conf` file 
in your config directory and specify the Mongo Metastore class:

```yaml
drill.metastore: {
  implementation.class: "org.apache.drill.metastore.mongo.MongoMetastore"
}
```

### Connection properties

Use the connection properties to specify how Drill should connect to your Metastore database.

`drill.metastore.mongo.connection` - connection url to your MongoDB. Required. 

### Custom configuration

`drill-metastore-override.conf` is used to customize connection details to the Drill Metastore database.
See `drill-metastore-override-example.conf` for more details.

#### Example of configuration

```yaml
drill.metastore: {
  implementation.class: "org.apache.drill.metastore.mongo.MongoMetastore",
  mongo: {
    connection: "mongodb://localhost:27017/"
  }
}
```

Note: username and password can also be included in the connection url.

## Tables structure

The Drill Metastore stores several types of metadata, called components. Currently, only the `tables` component is implemented.
The `tables` component provides metadata about Drill tables, including their segments, files, row groups and partitions.
In Drill `tables` component unit is represented by `TableMetadataUnit` class which is applicable to any metadata type.
The `TableMetadataUnit` class holds fields for all five metadata types within the `tables` component. 
Any fields not applicable to a particular metadata type are simply ignored and remain unset.

In the Mongo implementation of the Drill Metastore, all metadata of the tables component stored in
 one collection named `tables` in the `meta` database. The database and collection will be auto
  created when first write data into it.
