---
title: "COLLECT_LIST"
slug: "List Creation Functions"
parent: "Nested Data Functions"
---
Drill has several functions which can create lists/arrays or maps from your data.

## COLLECT_LIST
This function takes the values of an expression and converts them into a map

### Syntax

    COLLECT_LIST(<key> <expr>)

Where <key> is a literal containing a map key and <exper> is an expression. The function can contain many key/value pairs.
  
### Example

    apache drill> SELECT collect_list('n_nationkey', n_nationkey, 'n_name', n_name) as newlist
    FROM (SELECT * from cp.`tpch/nation.parquet` limit 2) group by 'a';
    +-------------------------------------------------------------------------------+
    |                                    newlist                                    |
    +-------------------------------------------------------------------------------+
    | [{"n_nationkey":0,"n_name":"ALGERIA"},{"n_nationkey":1,"n_name":"ARGENTINA"}] |
    +-------------------------------------------------------------------------------+
    1 row selected (0.186 seconds)
  


## COLLECT_TO_LIST_VARCHAR
This function takes the values of an expression and converts it to a list/array. 

### Syntax
  
    COLLECT_TO_LIST_VARCHAR(*column*)

Where *column* is a column that will be converted to a list (array).

### Example
The following query takes the `position_title` field and converts that field into a Drill list.  This function does not remove duplicates, so if you use this on a column 
containing non-unique values, it will simply convert all those values into a list. 

    apache drill> SELECT collect_to_list_varchar(position_title) FROM (SELECT * FROM cp.`employee.json` LIMIT 5);
    +----------------------------------------------------------------------------------+
    |                                      EXPR$0                                      |
    +----------------------------------------------------------------------------------+
    | ["President","VP Country Manager","VP Country Manager","VP Country Manager","VP Information Systems"] |
    +----------------------------------------------------------------------------------+
