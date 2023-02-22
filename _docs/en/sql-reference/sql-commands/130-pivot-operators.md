---
title: "Pivot Operators"
slug: "Pivot Operators"
parent: "SQL Commands"
---

**Introduced in release: 1.21**

{% include startnote.html %}
Bug DRILL-8403 in version 1.21.0 of Drill means that it does not correctly handle some aggregate functions including AVG, STDDEV and VARIANCE when they are used with the PIVOT operator. Such queries will succeed but return incorrect results that ignore the groups that have been pivoted to columns. Please upgrade to Drill 1.21.1.
{% include endnote.html %}

Place PIVOT and UNPIVOT relational operators beneath the table references in your query to respectively pivot rows up to columns or unpivot columns down to rows.

# PIVOT

The PIVOT operator will generate columns based on one more aggregate functions and one or more pivot expressions derived from the values occurring in one or more pivot columns. Groups and filtered aggregates are generated automatically making the PIVOT operator a more concise representation of queries that must otherwise be written using conditional expressions inside aggregate function calls and GROUP BY.

## Syntax
```
pivot:
  PIVOT '('
  pivotAgg [, pivotAgg ]*
  FOR pivotList
  IN '(' pivotExpr [, pivotExpr ]* ')'
  ')'

pivotAgg:
  agg '(' [ ALL | DISTINCT ] value [, value ]* ')'
  [ [ AS ] alias ]

pivotList:
  columnOrList

pivotExpr:
  exprOrList [ [ AS ] alias ]```
```

## Examples

Use PIVOT to generate columns for two marital statuses × two metrics leaving education_level in rows.

```sql
SELECT
	*
FROM
	(SELECT
		employee_id,
		education_level,
		salary,
		marital_status
	FROM
		cp.`employee.json`)
PIVOT (
	count(employee_id) employee_count, sum(salary) total_remun FOR marital_status IN ('M' married, 'S' single)
)
```
```
+---------------------+------------------------+---------------------+-----------------------+--------------------+
|   education_level   | married_employee_count | married_total_remun | single_employee_count | single_total_remun |
+---------------------+------------------------+---------------------+-----------------------+--------------------+
| Graduate Degree     | 85                     | 343270.0            | 85                    | 403510.0           |
| Bachelors Degree    | 144                    | 689640.0            | 143                   | 599680.0           |
| Partial College     | 152                    | 650770.0            | 136                   | 514800.0           |
| High School Degree  | 139                    | 480840.0            | 142                   | 507200.0           |
| Partial High School | 62                     | 220460.0            | 67                    | 232470.0           |
+---------------------+------------------------+---------------------+-----------------------+--------------------+
5 rows selected (0.445 seconds)
```

# UNPIVOT

The UNPIVOT operator will generate new rows in the place of one or more columns, moving their values to a new "unpivot measure" column. Unlike the PIVOT operator, no cardinality changes like grouping take place so that the number of values in the result is unchanged, only the axes along which they are laid out.

## Syntax
```
UNPIVOT [ INCLUDING NULLS | EXCLUDING NULLS ] '('
  unpivotMeasureList
  FOR unpivotAxisList
  IN '(' unpivotValue [, unpivotValue ]* ')'
  ')'

unpivotMeasureList:
  columnOrList

unpivotAxisList:
  columnOrList

unpivotValue:
  column [ AS literal ]
  |   '(' column [, column ]* ')' [ AS '(' literal [, literal ]* ')' ]
```

## Examples
Use UNPIVOT to generate rows for 5 dimensions × 3 observations.

```sql
WITH wide_form as (
	SELECT
    	random() dim1,
    	random() dim2,
    	random() dim3,
    	random() dim4,
    	random() dim5
    FROM cp.`employee.json`
    LIMIT 3
)
SELECT
	*
FROM
	wide_form
UNPIVOT (
	metric FOR dimension IN (dim1, dim2, dim3, dim4, dim5)
) as long_form
ORDER BY dimension;
```

```
+-----------+---------------------+
| dimension |       metric        |
+-----------+---------------------+
| dim1      | 0.2949968170510818  |
| dim1      | 0.08013928181408925 |
| dim1      | 0.7666829294454385  |
| dim2      | 0.12904903586688676 |
| dim2      | 0.2596097757126131  |
| dim2      | 0.8664893860232098  |
| dim3      | 0.1849098946061125  |
| dim3      | 0.8035574424732861  |
| dim3      | 0.633143190894335   |
| dim4      | 0.29900950161735684 |
| dim4      | 0.6081277181773982  |
| dim4      | 0.10303324887132925 |
| dim5      | 0.39592775091118426 |
| dim5      | 0.15143900714797243 |
| dim5      | 0.6540326371582511  |
+-----------+---------------------+
15 rows selected (0.333 seconds)
```

