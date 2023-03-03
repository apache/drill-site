---
title: "Aggregate and Aggregate Statistical"
slug: "Aggregate and Aggregate Statistical"
parent: "SQL Functions"
---

## Aggregate Functions

The following table lists the aggregate functions that you can use in Drill
queries.


| **Function**                                                 | **Argument Type**                                                                                                                       | **Return Type**                                                                                                                    |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| ANY_VALUE(expression)                                        | BIT, INT, BIGINT, FLOAT4, FLOAT8, DATE, TIMESTAMP, TIME, VARCHAR, VARBINARY, LIST, MAP, INTERVAL, INTERVALDAY, INTERVALYEAR, VARDECIMAL | Same as argument type                                                                                                              |
| AVG(expression)                                              | SMALLINT,   INTEGER, BIGINT, FLOAT, DOUBLE, DECIMAL, INTERVAL                                                                           | DECIMAL for DECIMAL argument,   DOUBLE for all other arguments                                                                     |
| BOOL_AND(expression), BOOL_OR(expression)                    | BIT                                                                                                                                     | BIT                                                                                                                                |
| BIT_AND(expression), BIT_OR(expression), BIT_XOR(expression) | INT, BIGINT                                                                                                                             | Same as argument type                                                                                                              |
| CORR(x,y)                                                    | Numeric                                                                                                                                 | Double                                                                                                                             |
| COVAR_POP(x,y)                                               | Numeric                                                                                                                                 | Double                                                                                                                             |
| COVAR_SAMP(x,y)                                              | Numeric                                                                                                                                 | Double                                                                                                                             |
| COUNT(\*)                                                    | -                                                                                                                                       | BIGINT                                                                                                                             |
| COUNT(\[DISTINCT\] expression)                               | any                                                                                                                                     | BIGINT                                                                                                                             |
| KENDALL_CORRELATION                                          | Numeric                                                                                                                                 | Double                                                                                                                             |
| MAX(expression), MIN(expression)                             | BINARY, DECIMAL, VARCHAR, DATE, TIME, or TIMESTAMP                                                                                      | Same   as argument type                                                                                                            |
| REGR_INTERCEPT                                               | Numeric                                                                                                                                 | Double                                                                                                                             |
| REGR_SLOPE                                                   | Numeric                                                                                                                                 | Double                                                                                                                             |
| STDDEV, STDDEV_POP, STDDEV_SAMP                              | Numeric                                                                                                                                 | Double                                                                                                                             |
| SUM(expression)                                              | SMALLINT, INTEGER, BIGINT, FLOAT, DOUBLE, DECIMAL, INTERVAL                                                                             | DECIMAL for DECIMAL   argument,     BIGINT for any integer-type argument (including BIGINT), DOUBLE for   floating-point arguments |
| VARIANCE, VAR_POP, VAR_SAMP                                  | Numeric                                                                                                                                 | Numeric                                                                                                                            |

- Drill 1.14 and later supports the ANY_VALUE function.
- Starting in Drill 1.14, the DECIMAL data type is enabled by default.
- AVG, COUNT, MIN, MAX, and SUM accept ALL and DISTINCT keywords. The default is
  ALL.
- The aggregate function examples use the `cp` storage plugin to access the
  [`employee.json`]({{site.baseurl}}/docs/querying-json-files/) file
  installed with Drill. By default, JSON reads numbers as double-precision
  floating point numbers. These examples assume that you are using the default
  option
  [all_text_mode]({{site.baseurl}}/docs/json-data-model/#handling-type-differences)
  set to false.

## ANY_VALUE

**Introdcued in release: 1.14**

Returns one of the values of value across all input values. This function is NOT specified in the SQL standard.

### ANY_VALUE Syntax

```
ANY_VALUE([ ALL | DISTINCT ] value)
```

### ANY_VALUE Examples

```
SELECT ANY_VALUE(employee_id) AS anyemp FROM cp.`employee.json`;
|--------|
| anyemp |
|--------|
| 1156   |
|--------|

SELECT ANY_VALUE(ALL employee_id) AS anyemp FROM cp.`employee.json`;
|--------|
| anyemp |
|--------|
| 1156   |
|--------|

SELECT ANY_VALUE(DISTINCT employee_id) AS anyemp FROM cp.`employee.json`;
|--------|
| anyemp |
|--------|
| 1156   |
|--------|

SELECT ANY_VALUE(employee_id) as anyemp, salary as empsal FROM cp.`employee.json` GROUP BY salary;
|--------|---------|
| anyemp | empsal  |
|--------|---------|
| 1155   | 20.0    |
| 197    | 3700.0  |
| 1115   | 4200.0  |
| 589    | 4300.0  |
| 403    | 4400.0  |
| 204    | 4500.0  |
...

SELECT ANY_VALUE(employee_id) as anyemp FROM cp.`employee.json` GROUP BY salary ORDER BY anyemp;
|--------|
| anyemp |
|--------|
| 1      |
| 4      |
| 6      |
| 8      |
| 10     |
| 13     |
...
```

## Filtered Aggregates

**Introduced in release: 1.21**

Starting in Drill 1.21 it is possible to follow an aggregate function invocation with a boolean expression that will filter the values procesed by the aggregate using the following syntax.
```
agg_func( column ) FILTER(WHERE boolean_expression)
```

For example
``` sql
SELECT
  count(n_name) FILTER(WHERE n_regionkey = 1) AS nations_count_in_1_region,
  count(n_name) FILTER(WHERE n_regionkey = 2) AS nations_count_in_2_region,
  count(n_name) FILTER(WHERE n_regionkey = 3) AS nations_count_in_3_region,
  count(n_name) FILTER(WHERE n_regionkey = 4) AS nations_count_in_4_region,
  count(n_name) FILTER(WHERE n_regionkey = 0) AS nations_count_in_0_region
FROM cp.`tpch/nation.parquet`
```
will return
```
+---------------------------+---------------------------+---------------------------+---------------------------+---------------------------+
| nations_count_in_1_region | nations_count_in_2_region | nations_count_in_3_region | nations_count_in_4_region | nations_count_in_0_region |
+---------------------------+---------------------------+---------------------------+---------------------------+---------------------------+
| 5                         | 5                         | 5                         | 5                         | 5                         |
+---------------------------+---------------------------+---------------------------+---------------------------+---------------------------+
```

**N.B.** Some versions of Drill prior to 1.21 do not fail if FILTER expressions are included with aggregate function calls, but silently do no filtering yielding incorrect results. Filtered aggregates are only supported from version 1.21 onward.

## AVG

Returns the average of a numerical expression.

### AVG Syntax

```
AVG([ALL | DISTINCT] expression)
```

### AVG Examples

```
ALTER SESSION SET `store.json.all_text_mode` = false;
|------|-----------------------------------|
| ok   | summary                           |
|------|-----------------------------------|
| true | store.json.all_text_mode updated. |
|------|-----------------------------------|
1 row selected (0.073 seconds)
```

Take a look at the salaries of employees having IDs 1139, 1140, and 1141. These
are the salaries that subsequent examples will average and sum.

```
SELECT * FROM cp.`employee.json` WHERE employee_id IN (1139, 1140, 1141);
|-------------|-----------------|------------|-----------|-------------|-------------------------|----------|---------------|------------|-----------------------|------------|---------------|-----------------|----------------|--------|----------------------|
| employee_id | full_name       | first_name | last_name | position_id | position_title          | store_id | department_id | birth_date | hire_date             | salary     | supervisor_id | education_level | marital_status | gender | management_role      |
|-------------|-----------------|------------|-----------|-------------|-------------------------|----------|---------------|------------|-----------------------|------------|---------------|-----------------|----------------|--------|----------------------|
| 1139        | Jeanette Belsey | Jeanette   | Belsey    | 12          | Store Assistant Manager | 18       | 11            | 1972-05-12 | 1998-01-01 00:00:00.0 | 10000.0000 | 17            | Graduate Degree | S              | M      | Store Management     |
| 1140        | Mona Jaramillo  | Mona       | Jaramillo | 13          | Store Shift Supervisor  | 18       | 11            | 1961-09-24 | 1998-01-01 00:00:00.0 | 8900.0000  | 1139          | Partial College | S              | M      | Store Management     |
| 1141        | James Compagno  | James      | Compagno  | 15          | Store Permanent Checker | 18       | 15            | 1914-02-02 | 1998-01-01 00:00:00.0 | 6400.0000  | 1139          | Graduate Degree | S              | M      | Store Full Time Staf |
|-------------|-----------------|------------|-----------|-------------|-------------------------|----------|---------------|------------|-----------------------|------------|---------------|-----------------|----------------|--------|----------------------|
3 rows selected (0.284 seconds)

SELECT AVG(salary) FROM cp.`employee.json` WHERE employee_id IN (1139, 1140, 1141);
|-------------------|
| EXPR$0            |
|-------------------|
| 8433.333333333334 |
|-------------------|
1 row selected (0.208 seconds)

SELECT AVG(ALL salary) FROM cp.`employee.json` WHERE employee_id IN (1139, 1140, 1141);
|-------------------|
| EXPR$0            |
|-------------------|
| 8433.333333333334 |
|-------------------|
1 row selected (0.17 seconds)

SELECT AVG(DISTINCT salary) FROM cp.`employee.json`;
|--------------------|
| EXPR$0             |
|--------------------|
| 12773.333333333334 |
|--------------------|
1 row selected (0.384 seconds)

SELECT education_level, AVG(salary) FROM cp.`employee.json` GROUP BY education_level;
|---------------------|--------------------|
| education_level     | EXPR$1             |
|---------------------|--------------------|
| Graduate Degree     | 4392.823529411765  |
| Bachelors Degree    | 4492.404181184669  |
| Partial College     | 4047.1180555555557 |
| High School Degree  | 3516.1565836298932 |
| Partial High School | 3511.0852713178297 |
|---------------------|--------------------|
5 rows selected (0.495 seconds)
```

## BOOL_AND and BOOL_OR

Returns the result of a logical AND (resp. OR) over the specified expression.

### BOOL_AND and BOOL_OR Syntax

```
BOOL_AND(expression)
BOOL_OR(expression)
```

### BOOL_AND and BOOL_OR Examples

```
SELECT BOOL_AND(last_name = 'Spence') FROM cp.`employee.json`;
|--------|
| EXPR$0 |
|--------|
| false  |
|--------|

SELECT BOOL_OR(last_name = 'Spence') FROM cp.`employee.json`;
|--------|
| EXPR$0 |
|--------|
| true   |
|--------|
```

### BOOL_AND and BOOL_OR Usage Notes

1. EVERY is nearly an alias for BOOL_AND but returns a TINYINT rather than a
   BIT.

## BIT_AND, BIT_OR and BIT_XOR

Returns the result of a bitwise AND (resp. OR, XOR) over the specified expression.

### BIT_AND, BIT_OR and BIT_XOR Syntax

```
BIT_AND(expression)
BIT_OR(expression)
BIT_XOR(expression)
```

### BIT_AND, BIT_OR, BIT_XOR Examples

```
SELECT BIT_AND(position_id) FROM cp.`employee.json`;
|--------|
| EXPR$0 |
|--------|
| 0      |
|--------|

SELECT BIT_OR(position_id) FROM cp.`employee.json`;
|--------|
| EXPR$0 |
|--------|
| 31     |
|--------|

SELECT BIT_XOR(position_id) FROM cp.`employee.json`;
|--------|
| EXPR$0 |
|--------|
| 4      |
|--------|
```

## CORR
Returns the [Pearson Correlation Coefficient](https://en.wikipedia.org/wiki/Pearson_correlation_coefficient) for a given x, y. 

```
SELECT CORR (department_id, salary) as correlation FROM cp.`employee.json`;
+---------------------+
|     correlation     |
+---------------------+
| -0.6699481585713246 |
+---------------------+
```

## COVAR_POP
Returns the population covariance for a data set.

```
SELECT covar_pop (department_id, salary) AS covariance FROM cp.`employee.json`;
+--------------------+
|     covariance     |
+--------------------+
| -9988.315451359776 |
+--------------------+
```

## COVAR_SAMP
Returns the sample covariance for a data set.

```
select covar_samp (department_id, salary) as covariance from cp.`employee.json`;
+--------------------+
|     covariance     |
+--------------------+
| -9996.970837366154 |
+--------------------+
```

## COUNT

Returns the number of rows that match the given criteria.

### COUNT Syntax

```
SELECT COUNT([ALL | DISTINCT] expression) FROM . . .
SELECT COUNT(*) FROM . . .
```

- expression\
  Returns the number of values of the specified expression.
- DISTINCT expression\
  Returns the number of distinct values in the expression.
- ALL expression\
  Returns the number of values of the specified expression.
- \* (asterisk)\
-  Returns the number of records in the table.

### COUNT Examples

```
SELECT COUNT(DISTINCT salary) FROM cp.`employee.json`;
|--------|
| EXPR$0 |
|--------|
| 48     |
|--------|
1 row selected (0.159 seconds)

SELECT COUNT(ALL salary) FROM cp.`employee.json`;
|--------|
| EXPR$0 |
|--------|
| 1155   |
|--------|
1 row selected (0.106 seconds)

SELECT COUNT(salary) FROM cp.`employee.json`;
|--------|
| EXPR$0 |
|--------|
| 1155   |
|--------|
1 row selected (0.102 seconds)

SELECT COUNT(*) FROM cp.`employee.json`;
|--------|
| EXPR$0 |
|--------|
| 1155   |
|--------|
1 row selected (0.174 seconds)
```

## KENDALL_CORRELATION

Returns the Kendall correlation coefficient.

### KENDALL_CORRELATION Syntax

```
KENDALL_CORRELATION( expression1, expression2 )
```

### KENDALL_CORRELATION Examples

```sql
with seq as (
  select row_number() over (order by 1) x from cp.`employee.json` limit 10
)
select kendall_correlation(x+random(), x+random()+5) from seq;
```
```
EXPR$0  0.2

1 row selected (0.213 seconds)
```

## MIN and MAX

These functions return the smallest and largest values of the selected
expressions, respectively.

### MIN and MAX Syntax

```
MIN(expression)
MAX(expression)
```

### MIN and MAX Examples

```
SELECT MIN(salary) FROM cp.`employee.json`;
|--------|
| EXPR$0 |
|--------|
| 20.0   |
|--------|
1 row selected (0.138 seconds)

SELECT MAX(salary) FROM cp.`employee.json`;
|---------|
| EXPR$0  |
|---------|
| 80000.0 |
|---------|
1 row selected (0.139 seconds)
```

Use a correlated subquery to find the names and salaries of the lowest paid
employees:

```
SELECT full_name, SALARY FROM cp.`employee.json` WHERE salary = (SELECT MIN(salary) FROM cp.`employee.json`);
|-----------------|--------|
| full_name       | SALARY |
|-----------------|--------|
| Leopoldo Renfro | 20.0   |
| Donna Brockett  | 20.0   |
| Laurie Anderson | 20.0   |
. . .
```

## SUM

Returns the sum of a numerical expresion.

### SUM syntax

```
SUM([DISTINCT | ALL] expression)
```

### Examples

```
SELECT SUM(ALL salary) FROM cp.`employee.json`;
|-----------|
| EXPR$0    |
|-----------|
| 4642640.0 |
|-----------|
1 row selected (0.123 seconds)

SELECT SUM(DISTINCT salary) FROM cp.`employee.json`;
|----------|
| EXPR$0   |
|----------|
| 613120.0 |
|----------|
1 row selected (0.309 seconds)

SELECT SUM(salary) FROM cp.`employee.json` WHERE employee_id IN (1139, 1140, 1141);
|---------|
| EXPR$0  |
|---------|
| 25300.0 |
|---------|
1 row selected (1.995 seconds)
```

## Aggregate Statistical Functions

The following table lists the aggregate statistical functions that you can use
in Drill queries.

| **Function**                  | **Argument Type**                                 | **Return Type**                                 |
| ----------------------------- | ------------------------------------------------- | ----------------------------------------------- |
| APPROX_COUNT_DUPS(expression) | any                                               | BIGINT                                          |
| STDDEV(expression)            | SMALLINT, INTEGER, BIGINT, FLOAT, DOUBLE, DECIMAL | DECIMAL for DECIMAL arguments, otherwise DOUBLE |
| STDDEV_POP(expression)        | SMALLINT, INTEGER, BIGINT, FLOAT, DOUBLE, DECIMAL | DECIMAL for DECIMAL arguments, otherwise DOUBLE |
| VARIANCE(expression)          | SMALLINT, INTEGER, BIGINT, FLOAT, DOUBLE, DECIMAL | DECIMAL for DECIMAL arguments, otherwise DOUBLE |
| VAR_POP(expression)           | SMALLINT, INTEGER, BIGINT, FLOAT, DOUBLE, DECIMAL | DECIMAL for DECIMAL arguments, otherwise DOUBLE |

## APPROX_COUNT_DUPS

Returns an approximate count of the values that are duplicates (not unique).

### APPROX_COUNT_DUPS Syntax

```
APPROX_COUNT_DUPS( expression )
```

### APPROX_COUNT_DUPS Examples

```
select
  COUNT(*),
  APPROX_COUNT_DUPS(e1.employee_id),
  APPROX_COUNT_DUPS(e1.gender)
FROM cp.`employee.json` e1

|--------|--------|--------|
| EXPR$0 | EXPR$1 | EXPR$2 |
| ------ | ------ | ------ |
| 1155   | 0      | 1153   |
|--------|--------|--------|
```

Use COUNT - APPROX_COUNT_DUPS to approximate a distinct count.

```
select
  COUNT(*),
  COUNT(salary) - APPROX_COUNT_DUPS(salary),
  COUNT(distinct salary)
from cp.`employee.json`;

|--------|--------|--------|
| EXPR$0 | EXPR$1 | EXPR$2 |
|--------|--------|--------|
| 1155   | 48     | 48     |
|--------|--------|--------|
```

### APPROX_COUNT_DUPS Usage Notes

The underlying Bloom filter is a probabilistic data structure that may return a
false positive when an element is tested for duplication. Consequently, the
approximate count returned _overestimates_ the true duplicate count. In return
for this inaccuracy, Bloom filters are highly space- and time-efficient at large
scales with the specifics determined by the parameters of the filter (see
below).

### Configuration options

{% include startnote.html %} The APPROX_COUNT_DUPS function is used internally
by Drill when it computes table statistics. As a result, setting configuration
options that affect it in the global configuration scope will affect the
computation of table statistics accordingly. {% include endnote.html %}

- exec.statistics.ndv_extrapolation_bf_elements
- exec.statistics.ndv_extrapolation_bf_fpprobability

## REGR_INTERCEPT

Returns the intercept of the least squares linear regression fit.

### REGR_INTERCEPT Syntax

```
REGR_INTERCEPT( expression1, expression2 )
```

### REGR_INTERCEPT Examples

```sql
with seq as (
  select row_number() over (order by 1) x from cp.`employee.json` limit 10
)
select regr_intercept(x+random(), x+random()+5) from seq;
```
```
EXPR$0  4.9715020855109255

1 row selected (0.221 seconds)
```

## REGR_SLOPE

Returns the slope of the least squares linear regression fit.

### REGR_INTERCEPT Syntax

```
REGR_INTERCEPT( expression1, expression2 )
```

### REGR_INTERCEPT Examples

```sql
with seq as (
  select row_number() over (order by 1) x from cp.`employee.json` limit 10
)
select regr_slope(x+random(), x+random()+5) from seq;
```
```
EXPR$0  0.9719696129009783

1 row selected (0.283 seconds)
```

## STDDEV

Returns the sample standard deviation.

### STDDEV Syntax

```
STDDEV(expression)
```

### STDDEV Examples

```
SELECT STDDEV(salary) from cp.`employee.json`;

|-------------------|
| EXPR$0            |
|-------------------|
| 5371.847873988941 |
|-------------------|
```

### STDDEV Usage Notes

1. Aliases: STDDEV_SAMP

## STDDEV_POP

Returns the estimate of the population standard deviation obtained by applying
Bessel's correction to the sample standard deviation.

### STDDEV_POP Syntax

```
STDDEV_POP(expression)
```

### STDDEV_POP Examples

```
SELECT STDDEV_POP(salary) from cp.`employee.json`;

|-------------------|
| EXPR$0            |
|-------------------|
| 5369.521895151171 |
|-------------------|
```

## VARIANCE

Returns the sample variance.

### VARIANCE Syntax

```
VARIANCE(expression)
```

### VARIANCE Examples

```
SELECT VARIANCE(salary) from cp.`employee.json`;

|--------------------|
| EXPR$0             |
|--------------------|
| 28856749.581279505 |
|--------------------|
```

### VARIANCE Usage Notes

1. Aliases: VAR_SAMP

## VAR_POP

Returns the estimate of the population variance obtained by applying Bessel's
correction to the sample variance.

### VAR_POP Syntax

```
VAR_POP(expression)
```

### VAR_POP Examples

```
SELECT VAR_POP(salary) from cp.`employee.json`;

|--------------------|
| EXPR$0             |
|--------------------|
| 28831765.382507823 |
|--------------------|
```
