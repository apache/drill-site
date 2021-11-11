---
title: "第二课: 使用 ANSI SQL 查询"
slug: "Lesson 2: Run Queries with ANSI SQL"
parent: "搭配 MapR Sandbox 学习 Drill"
lang: "zh"
---
## 目标

本课展示了如何在 Apache Drill 中进行一些标准的 SQL 分析：例如，使用简单的聚合函数汇总数据以及联接不同数据源。请注意，Apache Drill 提供 ANSI SQL 支持，而不是 “SQL-like” 的接口。

## 本课中的查询示例

假设用户知道数据源的原始形式，使用 select * 查询，尝试对每个数据源进行一些简单却实用的查询。这些查询展示了 Drill 如何支持 ANSI SQL 结构，以及如何在单个 SELECT 语句中组合来自不同数据源的数据。

* 对单个文件或表的聚合查询。使用 GROUP BY、WHERE、HAVING 和 ORDER BY 子句。
* 联接 Hive、MapR-DB 和文件系统数据源。
* 使用表和列的别名。
* 创建 Drill 视图。

## 聚合


### 设定 hive 的 schema：

    0: jdbc:drill:> use hive.`default`;
    |-------|-------------------------------------------|
    |  ok   |                  summary                  |
    |-------|-------------------------------------------|
    | true  | Default schema changed to [hive.default]  |
    |-------|-------------------------------------------|
    1 row selected 

### 按月返回销售总额：

    0: jdbc:drill:> select `month`, sum(order_total)
    from orders group by `month` order by 2 desc;
    |------------|---------|
    |   month    | EXPR$1  |
    |------------|---------|
    | June       | 950481  |
    | May        | 947796  |
    | March      | 836809  |
    | April      | 807291  |
    | July       | 757395  |
    | October    | 676236  |
    | August     | 572269  |
    | February   | 532901  |
    | September  | 373100  |
    | January    | 346536  |
    |------------|---------|
    10 rows selected 

Drill 支持 SUM、MAX、AVG、MIN 等 SQL 聚合函数。标准 SQL 子句在 Drill 查询中的工作方式与在关系型数据库查询中的工作方式相同。

请注意，“month” 列需要反勾号只是因为 “month” 是 SQL 中的保留字。

### 按月和状态返回前 20 名的销售总额：

    0: jdbc:drill:> select `month`, state, sum(order_total) as sales from orders group by `month`, state
    order by 3 desc limit 20;
    |-----------|--------|---------|
    |   month   | state  |  sales  |
    |-----------|--------|---------|
    | May       | ca     | 119586  |
    | June      | ca     | 116322  |
    | April     | ca     | 101363  |
    | March     | ca     | 99540   |
    | July      | ca     | 90285   |
    | October   | ca     | 80090   |
    | June      | tx     | 78363   |
    | May       | tx     | 77247   |
    | March     | tx     | 73815   |
    | August    | ca     | 71255   |
    | April     | tx     | 68385   |
    | July      | tx     | 63858   |
    | February  | ca     | 63527   |
    | June      | fl     | 62199   |
    | June      | ny     | 62052   |
    | May       | fl     | 61651   |
    | May       | ny     | 59369   |
    | October   | tx     | 55076   |
    | March     | fl     | 54867   |
    | March     | ny     | 52101   |
    |-----------|--------|---------|
    20 rows selected 

请注意 SUM 函数结果的别名。Drill 支持列别名和表别名。

## HAVING 子句

此查询使用 HAVING 子句来约束聚合结果。

### 将工作区设置为 dfs.clicks:

    0: jdbc:drill:> use dfs.clicks;
    |-------|-----------------------------------------|
    |  ok   |                 summary                 |
    |-------|-----------------------------------------|
    | true  | Default schema changed to [dfs.clicks]  |
    |-------|-----------------------------------------|
    1 row selected

### 返回高点击率设备的总点击次数：

    0: jdbc:drill:> select t.user_info.device, count(*) from `clicks/clicks.json` t 
    group by t.user_info.device
    having count(*) > 1000;
    |---------|---------|
    | EXPR$0  | EXPR$1  |
    |---------|---------|
    | IOS5    | 11814   |
    | AOS4.2  | 5986    |
    | IOS6    | 4464    |
    | IOS7    | 3135    |
    | AOS4.4  | 1562    |
    | AOS4.3  | 3039    |
    |---------|---------|
    6 rows selected

聚合结果是点击流数据中每个移动设备的点击计数。只有点击记录超过 1000 个事务的设备才会被统计进结果集

## UNION 运算符

使用和之前相同的工作区 (dfs.clicks).

### 合并营销活动前后的点击数:

    0: jdbc:drill:> select t.trans_id transaction, t.user_info.cust_id customer from `clicks/clicks.campaign.json` t 
    union all 
    select u.trans_id, u.user_info.cust_id  from `clicks/clicks.json` u limit 5;
    |-------------|------------|
    | transaction |  customer  |
    |-------------|------------|
    | 35232       | 18520      |
    | 31995       | 17182      |
    | 35760       | 18228      |
    | 37090       | 17015      |
    | 37838       | 18737      |
    |-------------|------------|

此 UNION ALL 查询返回存在于两个文件中的行（并包括这两个文件中重复的行）：`clicks.campaign.json` 和 `clicks.json`。

## 子查询

### 将工作区设置为 hive：

    0: jdbc:drill:> use hive.`default`;
    |-------|-------------------------------------------|
    |  ok   |                  summary                  |
    |-------|-------------------------------------------|
    | true  | Default schema changed to [hive.default]  |
    |-------|-------------------------------------------|
    1 row selected

### 比较各州的订单总数：

    0: jdbc:drill:> select ny_sales.cust_id, ny_sales.total_orders, ca_sales.total_orders
    from
    (select o.cust_id, sum(o.order_total) as total_orders from hive.orders o where state = 'ny' group by o.cust_id) ny_sales
    left outer join
    (select o.cust_id, sum(o.order_total) as total_orders from hive.orders o where state = 'ca' group by o.cust_id) ca_sales
    on ny_sales.cust_id = ca_sales.cust_id
    order by ny_sales.cust_id
    limit 20;
    |------------|------------|------------|
    |  cust_id   |  ny_sales  |  ca_sales  |
    |------------|------------|------------|
    | 1001       | 72         | 47         |
    | 1002       | 108        | 198        |
    | 1003       | 83         | null       |
    | 1004       | 86         | 210        |
    | 1005       | 168        | 153        |
    | 1006       | 29         | 326        |
    | 1008       | 105        | 168        |
    | 1009       | 443        | 127        |
    | 1010       | 75         | 18         |
    | 1012       | 110        | null       |
    | 1013       | 19         | null       |
    | 1014       | 106        | 162        |
    | 1015       | 220        | 153        |
    | 1016       | 85         | 159        |
    | 1017       | 82         | 56         |
    | 1019       | 37         | 196        |
    | 1020       | 193        | 165        |
    | 1022       | 124        | null       |
    | 1023       | 166        | 149        |
    | 1024       | 233        | null       |
    |------------|------------|------------|

这个例子展示了 Drill 对子查询的支持。

## CAST 函数

### 使用 maprdb 工作区：

    0: jdbc:drill:> use maprdb;
    |-------|-------------------------------------|
    |  ok   |               summary               |
    |-------|-------------------------------------|
    | true  | Default schema changed to [maprdb]  |
    |-------|-------------------------------------|
    1 row selected (0.088 seconds)

### 返回数据类型对应的客户数据：

    0: jdbc:drill:> select cast(row_key as int) as cust_id, cast(t.personal.name as varchar(20)) as name, 
    cast(t.personal.gender as varchar(10)) as gender, cast(t.personal.age as varchar(10)) as age,
    cast(t.address.state as varchar(4)) as state, cast(t.loyalty.agg_rev as dec(7,2)) as agg_rev, 
    cast(t.loyalty.membership as varchar(20)) as membership
    from customers t limit 5;
    |----------|----------------------|-----------|-----------|--------|----------|-------------|
    | cust_id  |         name         |  gender   |    age    | state  | agg_rev  | membership  |
    |----------|----------------------|-----------|-----------|--------|----------|-------------|
    | 10001    | "Corrine Mecham"     | "FEMALE"  | "15-20"   | "va"   | 197.00   | "silver"    |
    | 10005    | "Brittany Park"      | "MALE"    | "26-35"   | "in"   | 230.00   | "silver"    |
    | 10006    | "Rose Lokey"         | "MALE"    | "26-35"   | "ca"   | 250.00   | "silver"    |
    | 10007    | "James Fowler"       | "FEMALE"  | "51-100"  | "me"   | 263.00   | "silver"    |
    | 10010    | "Guillermo Koehler"  | "OTHER"   | "51-100"  | "mn"   | 202.00   | "silver"    |
    |----------|----------------------|-----------|-----------|--------|----------|-------------|

请注意此查询的以下功能：

* 表中的每一列都需要 CAST 函数。此函数将 MapR-DB/HBase 二进制数据转换为可读整数和字符串返回。也可以使用 CONVERT_TO/CONVERT_FROM 函数来解码字符串列。在大多数情况下，CONVERT_TO/CONVERT_FROM 比 CAST 更高效。CONVERT_TO 可以将二进制类型转换为 VARCHAR 以外的任何类型。
* row_key 列作为表的主键（在本例中为客户 ID）。
* 表别名 t 是必需的；否则列族名称将被解析为表名称致使查询错误。

### 从字符串中删除引号：

可以使用 regexp_replace 函数删除查询结果中字符串周围的引号。例如，返回状态名称 va 而不是 “va”：

    0: jdbc:drill:> select cast(row_key as int), regexp_replace(cast(t.address.state as varchar(10)),'"','')
    from customers t limit 1;
    |------------|------------|
    |   EXPR$0   |   EXPR$1   |
    |------------|------------|
    | 10001      | va         |
    |------------|------------|
    1 row selected

## 创建视图命令

    0: jdbc:drill:> use dfs.views;
    |-------|----------------------------------------|
    |  ok   |                summary                 |
    |-------|----------------------------------------|
    | true  | Default schema changed to [dfs.views]  |
    |-------|----------------------------------------|
    1 row selected

### 使用可变工作区：

可变（或可写）工作区是为写操作启用的工作区。此属性是存储插件配置的一部分。可以在可变工作区中创建 Drill 视图和表格。

### 在 MapR-DB 表上创建视图:

    0: jdbc:drill:> create or replace view custview as select cast(row_key as int) as cust_id,
    cast(t.personal.name as varchar(20)) as name, 
    cast(t.personal.gender as varchar(10)) as gender, 
    cast(t.personal.age as varchar(10)) as age, 
    cast(t.address.state as varchar(4)) as state,
    cast(t.loyalty.agg_rev as dec(7,2)) as agg_rev,
    cast(t.loyalty.membership as varchar(20)) as membership
    from maprdb.customers t;
    |-------|-------------------------------------------------------------|
    |  ok   |                           summary                           |
    |-------|-------------------------------------------------------------|
    | true  | View 'custview' created successfully in 'dfs.views' schema  |
    |-------|-------------------------------------------------------------|
    1 row selected

Drill 提供了类似于关系型数据库的 CREATE 和 REPLACE VIEW 语法来创建视图。使用 OR REPLACE 无需先将视图删除，且可以轻松地稍后更新。请注意，此示例中的 FROM 子句必须引用 maprdb.customers。MapR-DB 表对 dfs.views 工作区并不直接可见。

传统数据库的视图通常是通过数据库管理员/开发人员的操作，Drill 中的视图基于文件系统且非常轻量级。视图只是具有特定扩展名 (.drill) 的特殊文件。用户甚至可以将视图存储在本地文件系统中或指向特定工作区。用户可以在 CREATE VIEW 语句中指定针对任何 Drill 数据源的任何查询。

Drill 提供了一个去中心化的元数据模型。Drill 能够查询在 Hive、HBase 和文件系统等数据源中定义的元数据。Drill 还支持在文件系统中创建元数据。

### 从视图中查询数据:

    0: jdbc:drill:> select * from custview limit 1;
    |----------|-------------------|-----------|----------|--------|----------|-------------|
    | cust_id  |       name        |  gender   |   age    | state  | agg_rev  | membership  |
    |----------|-------------------|-----------|----------|--------|----------|-------------|
    | 10001    | "Corrine Mecham"  | "FEMALE"  | "15-20"  | "va"   | 197.00   | "silver"    |
    |----------|-------------------|-----------|----------|--------|----------|-------------|
    1 row selected

用户可以直接从文件系统中探索可用的数据，视图可以将数据读入下游工具进行分析和可视化，就像 Tableau 和 MicroStrategy 一样。对于这些工具，视图仅显示为“表格”，其中包含可选择的“列”。

## 跨数据源查询

继续在查询中使用 `dfs.views`。

### 联接客户视图和订单表：

    0: jdbc:drill:> select membership, sum(order_total) as sales from hive.orders, custview
    where orders.cust_id=custview.cust_id
    group by membership order by 2;
    |------------|------------|
    | membership |   sales    |
    |------------|------------|
    | "basic"    | 380665     |
    | "silver"   | 708438     |
    | "gold"     | 2787682    |
    |------------|------------|
    3 rows selected

在这个查询中，我们从 MapR-DB 表（由 custview 表示）读取数据，并将其与 Hive 中的订单信息结合起来。 在进行这样的跨数据源查询时，您需要使用完全限定的表/视图名称。 例如，订单表以“hive”为前缀，这是在 Drill 中注册的存储插件名称。 我们没有为“custview”使用任何前缀，因为我们明确地切换了存储 custview 的 dfs.views 工作区。

注意：如果任何查询的结果由于行宽而有删节，请将显示的最大宽度设置为 10000：

不要在 SET 命令中使用分号。

### 联接客户、订单和点击流数据：

    0: jdbc:drill:> select custview.membership, sum(orders.order_total) as sales from hive.orders, custview,
    dfs.`/mapr/demo.mapr.com/data/nested/clicks/clicks.json` c 
    where orders.cust_id=custview.cust_id and orders.cust_id=c.user_info.cust_id 
    group by custview.membership order by 2;
    |------------|------------|
    | membership |   sales    |
    |------------|------------|
    | "basic"    | 372866     |
    | "silver"   | 728424     |
    | "gold"     | 7050198    |
    |------------|------------|
    3 rows selected

这是一个联接三个不同数据源的三向查询：

* hive.orders 表
* custview (HBase 客户表中的视图)
* clicks.json 文件

不同的数据集通过 cust_id 联接。此查询使用视图工作区，以便可以访问 custview。hive.orders 表对查询也是可见的。

请注意 JSON 文件不能直接从视图工作区中看到，因此查询指定了文件的完整路径：

    dfs.`/mapr/demo.mapr.com/data/nested/clicks/clicks.json`


## 下一步

前往 [第 3 课: 对复杂数据类型进行查询]({{ site.baseurl }}/docs/lesson-3-run-queries-on-complex-data-types). 



