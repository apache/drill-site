---
title: "CREATE TABLE AS (CTAS)"
slug: "CREATE TABLE AS (CTAS)"
parent: "SQL Commands"
---
Use the CREATE TABLE AS (CTAS) command to create tables in Drill.  In addition to file systems, other plugins support writing and insert. Specifically:
* Googlesheets
* JDBC
* Splunk

## Syntax

    CREATE TABLE name [ (column list) ] AS query;

## Parameters
*name*
A unique directory name, optionally prefaced by a storage plugin name, such as dfs, and a workspace, such as tmp using [dot notation]({{site.baseurl}}/docs/workspaces).

*column list*
An optional list of column names or aliases in the new table.

*query*
A SELECT statement that needs to include aliases for ambiguous column names, such as COLUMNS[0]. Using SELECT * is [not recommended]({{site.baseurl}}/docs/text-files-csv-tsv-psv/#tips-for-performant-querying) when selecting CSV, TSV, and PSV data.

## Usage Notes

- By default, Drill returns a result set when you issue DDL statements, such as CTAS. If the client tool from which you connect to Drill (via JDBC) does not expect a result set when you issue DDL statements, set the `exec.query.return_result_set_for_ddl` option to false, as shown, to prevent the client from canceling queries:

		SET `exec.query.return_result_set_for_ddl` = false
		//This option is available in Drill 1.15 and later.

	When set to false, Drill returns the affected rows count, and the result set is null.

- You can use the [PARTITION BY]({{site.baseurl}}/docs/partition-by-clause) clause in a CTAS command.

- Drill writes files having names, such as 0_0_0.parquet, to the directory named in the CTAS command or to the workspace that is in use when you run the CTAS statement. You query the directory as you would query a table.

       - The following command writes Parquet data from `nation.parquet`, installed with Drill, to the `/tmp/name_key` directory.

              USE dfs;
              CREATE TABLE tmp.`name_key` (N_NAME, N_NATIONKEY) AS SELECT N_NATIONKEY, N_NAME FROM dfs.`/Users/drilluser/apache-drill-1.0/sample-data/nation.parquet`;


       - To query the data, use this command:

              SELECT * FROM tmp.`name_key`;



       - This example writes a JSON table to the `/tmp/by_yr` directory that contains [Google Ngram data]({{site.baseurl}}/docs/partition-by-clause/#partioning-example).

              Use dfs.tmp;
              CREATE TABLE by_yr (yr, ngram, occurrances) AS SELECT COLUMNS[0] ngram, COLUMNS[1] yr, COLUMNS[2] occurrances FROM `googlebooks-eng-all-5gram-20120701-zo.tsv` WHERE (columns[1] = '1993');

- Drill 1.11 introduces the `exec.persistent_table.umask` option, which enables you to set permissions on tables and directories that result from running the CTAS command. By default, the option is set to 002, which sets the default directory permissions to 775 and default file permissions to 664. Use the [SET]({{site.baseurl}}/docs/set/) command to change the setting for this option at the system or session level, as shown:

        ALTER SYSTEM|SESSION SET `exec.persistent_table.umask` = '000';

       - Setting the option to '000' sets the folder permissions to 777 and the file permissions to 666. This setting gives full access to folders and files when you create a table.

## Setting the Storage Format

Before using CTAS, set the `store.format` option for the table to one of the following formats:

  * csv, tsv, psv
  * parquet
  * json

Use the ALTER SESSION command as [shown in the example]({{site.baseurl}}/docs/create-table-as-ctas/#alter-session-command) in this section to set the `store.format` option.

## Restrictions

You can only create new tables in workspaces. You cannot create tables using
storage plugins, such as Hive and HBase, that do not specify a workspace.

You must use a writable (mutable) workspace when creating Drill tables. For
example:

	"tmp": {
	      "location": "/tmp",
	      "writable": true,
	       }

## Complete CTAS Example

The following query returns one row from a JSON file that [you can download]({{site.baseurl}}/docs/sample-data-donuts):

	0: jdbc:drill:zk=local> SELECT id, type, name, ppu
	FROM dfs.`/Users/brumsby/drill/donuts.json`;
	|------------|------------|------------|------------|
	|     id     |    type    |    name    |    ppu     |
	|------------|------------|------------|------------|
	| 0001       | donut      | Cake       | 0.55       |
	|------------|------------|------------|------------|
	1 row selected (0.248 seconds)

To create and verify the contents of a table that contains this row:

  1. Set the workspace to a writable workspace.
  2. Set the `store.format` option appropriately.
  3. Run a CTAS statement that contains the query.
  4. Go to the directory where the table is stored and check the contents of the file.
  5. Run a query against the new table by querying the directory that contains the table.

The following sqlline output captures this sequence of steps.

### Workspace Definition

	"tmp": {
	      "location": "/tmp",
	      "writable": true,
	       }

### ALTER SESSION Command

    ALTER SESSION SET `store.format`='json';

### USE Command

	0: jdbc:drill:zk=local> USE dfs.tmp;
	|------|-------------------------------------|
	| ok   | summary                             |
	|------|-------------------------------------|
	| true | Default schema changed to 'dfs.tmp' |
	|------|-------------------------------------|
	1 row selected (0.03 seconds)

### CTAS Command

	0: jdbc:drill:zk=local> CREATE TABLE donuts_json AS
	SELECT id, type, name, ppu FROM dfs.`/Users/brumsby/drill/donuts.json`;
	|------------|---------------------------|
	|  Fragment  | Number of records written |
	|------------|---------------------------|
	| 0_0        | 1                         |
	|------------|---------------------------|
	1 row selected (0.107 seconds)

### File Contents

	administorsmbp7:tmp brumsby$ pwd
	/tmp
	administorsmbp7:tmp brumsby$ cd donuts_json
	administorsmbp7:donuts_json brumsby$ more 0_0_0.json
	{
	 "id" : "0001",
	  "type" : "donut",
	  "name" : "Cake",
	  "ppu" : 0.55
	}

### Query Against New Table

	0: jdbc:drill:zk=local> SELECT * FROM donuts_json;
	|------------|------------|------------|------------|
	|     id     |    type    |    name    |    ppu     |
	|------------|------------|------------|------------|
	| 0001       | donut      | Cake       | 0.55       |
	|------------|------------|------------|------------|
	1 row selected (0.053 seconds)

### Use a Different Output Format

You can run the same sequence again with a different storage format set for
the system or session (csv or Parquet). For example, if the format is set to
csv, and you name the directory donuts_csv, the resulting file would look like
this:

	administorsmbp7:tmp brumsby$ cd donuts_csv
	administorsmbp7:donuts_csv brumsby$ ls
	0_0_0.csv
	administorsmbp7:donuts_csv brumsby$ more 0_0_0.csv
	id,type,name,ppu
	0001,donut,Cake,0.55


# Writing to JDBC Data Sources
It is now possible to write to databases via Drill's JDBC Storage Plugin.  At present Drill supports the following query formats for writing:

* `CREATE TABLE AS`
* `CREATE TABLE IF NOT EXISTS`
* `DROP TABLE`
* `DROP TABLE IF NOT EXISTS`

For further information about Drill's support for CTAS queries please refer to the documentation page here: https://drill.apache.org/docs/create-table-as-ctas/. The syntax is 
exactly the same as writing to a file.  As with writing to files, it is a best practice to avoid `SELECT *` queries in the CTAS query. 

Not all JDBC sources will support writing. In order for the connector to successfully write, the source system must support `CREATE TABLE AS` as well as `INSERT` queries.  
At present, Writing has been tested with MySQL, Postgres and H2.

#### Note about Apache Phoenix
Apache Phoenix uses slightly non-standard syntax for INSERTs.  The JDBC writer should support writes to Apache Phoenix though this has not been tested and should be regarded as 
an experimental feature.

## Configuring the Connection for Writing
Firstly, it should go without saying that the Database to which you are writing should have a user permissions which allow writing.  Next, you will need to set the `writable` 
parameter to `true` as shown below:

### Setting the Batch Size
Drill after creating the table, Drill will execute a series of `INSERT` queries with the data you are adding to the new table.  How many records can be inserted into the 
database at once is a function of your specific database.  Larger numbers will result in fewer insert queries, and more likely faster overall performance, but may also overload 
your database connection.  You can configure the batch size by setting the `writerBatchSize` variable in the configuration as shown below.  The default is 10000 records per batch.

### Sample Writable MySQL Connection
```json
{
  "type": "jdbc",
  "driver": "com.mysql.cj.jdbc.Driver",
  "url": "jdbc:mysql://localhost:3306/?useJDBCCompliantTimezoneShift=true&serverTimezone=EST5EDT",
  "username": "<username>",
  "password": "<password>",
  "writable": true,
  "writerBatchSize": 10000,
  "enabled": true
}
```
### Sample Writable Postgres Connection
```json
{
  "type": "jdbc",
  "driver": "org.postgresql.Driver",
  "url": "jdbc:postgresql://localhost:5432/sakila?defaultRowFetchSize=2",
  "username": "postgres",
  "sourceParameters": {
    "minimumIdle": 5,
    "autoCommit": false,
    "connectionTestQuery": "select version() as postgresql_version",
    "dataSource.cachePrepStmts": true,
    "dataSource.prepStmtCacheSize": 250
  },
  "writable": true
}
```

## Limitations

### Row Limits
The first issue to be aware of is that most relational databases have some sort of limit on how many rows can be inserted at once and how many columns a table may contain.  It 
is important to be aware of these limits and make sure that your database is configured to receive the amount of data you are trying to write.  For example, you can configure 
MySQL by setting the `max_packet_size` variable to accept very large inserts.

### Data Types
While JDBC is a standard for interface, different databases handle datatypes in different manners.  The JDBC writer tries to map data types to the most generic way possible so 
that it will work in as many cases as possible. 

#### Compound Data Types
Most relational databases do not support compound fields of any sort.  As a result, attempting to write a compound type to a JDBC data source, will result in an exception. 
Future functionality may include the possibility of converting complex types to strings and inserting those strings into the target database.

#### VarBinary Data
It is not currently possible to insert a VarBinary field into a JDBC database.


