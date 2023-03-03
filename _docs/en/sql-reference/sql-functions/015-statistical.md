---
title: "Statistical"
slug: "Statistical"
parent: "SQL Functions"
---
Drill supports the scalar statistical functions shown in the following table.

## Table of statistical functions

| Function                               | Return Type | Description                                                                                                                    |
| -------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| width_bucket(value, min, max, buckets) | INT         | Returns the 1-based bucket index of the value after dividing the interval between min and max into the given number of buckets |

## WIDTH_BUCKET

Returns the 1-based bucket index of _value_ after dividing the interval between _min_ and _max_ into the given number of buckets. A _value_ that falls outside the given range are given an index of 0 (_value_ \< _min_) or _buckets_ + 1 (_value_ > _max_).

### WIDTH_BUCKET Syntax

```
WIDTH_BUCKET( value, min, max, buckets )
```

### WIDTH_BUCKET Examples

```
apache drill> select width_bucket(3, 0, 10, 5);
EXPR$0  2

1 row selected (0.201 seconds)

apache drill> select width_bucket(1000, 0, 10, 5);
EXPR$0  6

1 row selected (0.131 seconds)
```
