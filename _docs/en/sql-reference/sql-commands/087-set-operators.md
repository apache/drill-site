---
title: "Set Operators"
slug: "Set Operators"
parent: "SQL Commands"
---

The UNION, INTERSECT and EXCEPT set operators combine the result sets of two separate query expressions. The result set of each query must have the same number of columns and compatible data types.

# UNION

The UNION operator computes the set union of its two arguments, automatically removing duplicate records from the result set. UNION ALL returns all duplicate records.

## Syntax
The UNION operator supports the following syntax:

       query
       { UNION [ ALL ] }
       another_query

## Parameters
*query*, *another_query*

Any SELECT query that Drill supports. See [SELECT]({{site.baseurl}}/docs/select/).

## Examples
The following example uses the UNION ALL set operator to combine click activity data before and after a marketing campaign. The data in the example exists in the `dfs.clicks workspace`.

       0: jdbc:drill:> SELECT t.trans_id transaction, t.user_info.cust_id customer
       FROM `clicks/clicks.campaign.json` t
       UNION ALL
       SELECT u.trans_id, u.user_info.cust_id FROM `clicks/clicks.json` u LIMIT 5;
       |-------------|------------|
       | transaction |  customer  |
       |-------------|------------|
       | 35232       | 18520      |
       | 31995       | 17182      |
       | 35760       | 18228      |
       | 37090       | 17015      |
       | 37838       | 18737      |
       |-------------|------------|

This UNION ALL query returns rows that exist in two files (and includes any duplicate rows from those files): `clicks.campaign.json` and `clicks.json`

If a query on either side of the UNION operator queries an empty directory, as shown in the following example where empty_DIR is an empty directory:

       0: jdbc:drill:schema=dfs.tmp> select columns[0] from empty_DIR UNION ALL select cast(columns[0] as int) c1 from `testWindow.csv`;

Drill treats the empty directory as a schemaless table and returns results as if the UNION operator is not included in the query.

# INTERSECT and EXCEPT

**Introduced in release: 1.21**
The INTERSECT and EXCEPT operators respectively compute the set intersection and the set difference of their two arguments. As with the UNION operator, duplicate records are auotmatically removed from the result set.

## Syntax

These set operators support the following syntax:

```
query
{ INTERSECT | EXCEPT }
another_query
```

## Parameters
*query*, *another_query*

Any SELECT query that Drill supports. See [SELECT]({{site.baseurl}}/docs/select/).

## Examples

### Compute { 1, 2, 4 } ∩ { 4, 5, 6 }.
```
apache drill> WITH
	X AS (SELECT employee_id AS col FROM cp.`employee.json` LIMIT 3 OFFSET 0),
	Y AS (SELECT employee_id AS col FROM cp.`employee.json` LIMIT 3 OFFSET 2)
SELECT COL FROM X
INTERSECT
SELECT col FROM Y;

col  4

1 row selected (0.449 seconds)
```

### Compute { 1, 2, 4 } ∖ { 4, 5, 6 }

```
apache drill> WITH
	X AS (SELECT employee_id AS col FROM cp.`employee.json` LIMIT 3 OFFSET 0),
	Y AS (SELECT employee_id AS col FROM cp.`employee.json` LIMIT 3 OFFSET 2)
SELECT COL FROM X
EXCEPT
SELECT col FROM Y;

col  1

col  2

2 rows selected (0.41 seconds)
```

# Set operator usage notes
   * The two SELECT query expressions that represent the direct operands of the set operator must produce the same number of columns. Corresponding columns must contain compatible data types. See [Supported Data Types]({{site.baseurl}}/docs/supported-data-types/).
   * Multiple set operators in the same SELECT statement are evaluated left to right, unless otherwise indicated by parentheses.
   * You can only use * on either side of a set operator when the data source has a defined schema, such as data in Hive or views.
   * You must explicitly specify columns.
   * Drill 1.13 and later supports queries on empty directories. An empty directory in a query interacts with set operators in the same way is if it is the empty set. See [Schemaless Tables]({{site.baseurl}}/docs/data-sources-and-file-formats-introduction/#schemaless-tables) for more information.


