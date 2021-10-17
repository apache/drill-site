---
title: "第一课: 学习数据集"
slug: "Lesson 1: Learn about the Data Set"
parent: "搭配 MapR Sandbox 学习 Drill"
lang: "zh"
---
## 目标

本教程讨论如何使用简单的 SQL SELECT 语句，发现可用数据及其对应格式。Drill 可以在没有预先了解或定义 schema 的情况下分析数据。
这意味着你可以立即开始查询数据（甚至在数据发生变化时），而无需知道数据格式。

本教程的数据集包括：

  * 事务数据：存储为 Hive 表
  * 产品目录和主客户数据：存储为 MapR-DB 表
  * 点击流和日志数据：作为 JSON 文件存储在 MapR 文件系统中

## 本教程中的查询

本教程包括对每个数据源的 select * 查询。

## 在你开始之前

### 启动 Drill Shell

如果 Drill shell 尚未启动，请使用终端或命令提示符登录 mapr 账户进入演示虚拟机，
并输入 `sqlline`，请参考 ["了解 Drill Sandbox"]({{ site.baseurl }}/docs/getting-to-know-the-drill-sandbox):

你可以运行查询来完成本教程。要退出
Drill shell，输入：

`0: jdbc:drill:> !quit`

本教程中的示例使用 Drill shell。你也可以使用 Drill Web UI 执行查询。

### 启用 DECIMAL 数据类型

本教程在一些示例中使用 DECIMAL 数据类型。在此版本中默认禁用 DECIMAL 数据类型，因此在进行查询之前要启用 DECIMAL 数据类型：

    alter session set `planner.enable_decimal_data_type`=true;

    |-------|--------------------------------------------|
    |  ok   |                  summary                   |
    |-------|--------------------------------------------|
    | true  | planner.enable_decimal_data_type updated.  |
    |-------|--------------------------------------------|
    1 row selected 

### 列出可用的工作区和数据库：

    0: jdbc:drill:> show databases;
    |---------------------|
    |     SCHEMA_NAME     |
    |---------------------|
    | INFORMATION_SCHEMA  |
    | cp.default          |
    | dfs.clicks          |
    | dfs.default         |
    | dfs.logs            |
    | dfs.root            |
    | dfs.tmp             |
    | dfs.views           |
    | hive.default        |
    | maprdb              |
    | sys                 |
    |---------------------|

此命令将 Drill 中配置的存储插件中所有可用的元数据列为一组 schema。Hive 和 MapR-DB 数据库、文件系统和其他数据都在文件系统中配置。
在本教程中运行查询时，可以使用 USE 命令在 schema 之间切换。以这种方式切换 schema 类似于在关系型数据库中使用不同的 schema（namespaces）。

## 查询 Hive 表

订单表是在 Hive 元存储中定义的六列 Hive 表。
这是一个 Hive 外部表，指向存储在 MapR 文件系统上的平面文件中的数据。订单表包含 122,000 行。

### 选定 Hive 的 schema

    0: jdbc:drill:> use hive.`default`;
    |-------|-------------------------------------------|
    |  ok   |                  summary                  |
    |-------|-------------------------------------------|
    | true  | Default schema changed to [hive.default]  |
    |-------|-------------------------------------------|
    1 row selected

本教程中均使用 USE 命令设定 schema。

### 使用 Describe 命令：

可以使用 DESCRIBE 命令显示 Hive 表的列和数据类型：

    0: jdbc:drill:> describe orders;
    |-------------|------------|-------------|
    | COLUMN_NAME | DATA_TYPE  | IS_NULLABLE |
    |-------------|------------|-------------|
    | order_id    | BIGINT     | YES         |
    | month       | VARCHAR    | YES         |
    | cust_id     | BIGINT     | YES         |
    | state       | VARCHAR    | YES         |
    | prod_id     | BIGINT     | YES         |
    | order_total | INTEGER    | YES         |
    |-------------|------------|-------------|

DESCRIBE 命令根据 Hive 元存储中可用的元数据返回 Hive 表的完整 schema 信息。

### 从订单表中选择 5 行：

    0: jdbc:drill:> select * from orders limit 5;
    |------------|------------|------------|------------|------------|-------------|
    |  order_id  |   month    |  cust_id   |   state    |  prod_id   | order_total |
    |------------|------------|------------|------------|------------|-------------|
    | 67212      | June       | 10001      | ca         | 909        | 13          |
    | 70302      | June       | 10004      | ga         | 420        | 11          |
    | 69090      | June       | 10011      | fl         | 44         | 76          |
    | 68834      | June       | 10012      | ar         | 0          | 81          |
    | 71220      | June       | 10018      | az         | 411        | 24          |
    |------------|------------|------------|------------|------------|-------------|

因为订单表是一个 Hive 表，所以用户可以像查询关系数据库表中的列一样查询数据。请注意标准 LIMIT 子句的使用，它将结果集限制为指定的行数。你可以选择是否使用 ORDER BY 搭配 LIMIT 子句。

Drill 可以对 Metastore 中定义的 Hive 表进行查询而无需额外配置，从而提供与 Hive 的无缝集成。Hive 并不是 Drill 的依赖，而只是作为 Drill 的存储插件或数据源。Drill 还允许用户查询所有 Hive 文件格式（包括自定义 serdes）。此外，在 Hive 中定义的任何 UDF 都可以用作 Drill 查询的一部分。

Drill 拥有自己的低延迟 SQL 查询执行引擎，使用户可以高性能的查询 Hive 表，并支持交互式和 ad-hoc 数据探索。

## 查询 MapR-DB 和 HBase 表

客户和产品表是 MapR-DB 表。MapR-DB 是企业级 Hadoop NoSQL 数据库。
它公开了 HBase API 以支持应用程序开发。在一个或多个列族之外，每个 MapR-DB 表都有一个 row_key。
每个列族都包含一个或多个特定的列。row_key 是标识每一行的唯一主键。

Drill 直接查询 MapR-DB 和 HBase 表。与其他 Hadoop 选项中的 SQL 不同，Drill 不需要 Hive 中的 schema 定义来处理这些数据。当用户有一个典型的包含数千列的时间序列的 MapR-DB 或 HBase 表时，Drill 消除了必须在 Hive 中管理重复 schema 的痛苦。

### 产品表

产品表有两个列族。

<table ><colgroup><col /><col /></colgroup><tbody><tr><td ><span style="color: rgb(0,0,0);">Column Family</span></td><td ><span style="color: rgb(0,0,0);">Columns</span></td></tr><tr><td ><span style="color: rgb(0,0,0);">details</span></td><td ><span style="color: rgb(0,0,0);">name</br></span><span style="color: rgb(0,0,0);">category</span></td></tr><tr><td ><span style="color: rgb(0,0,0);">pricing</span></td><td ><span style="color: rgb(0,0,0);">price</span></td></tr></tbody></table>  
产品表包含 965 行。

### 用户表

用户表有三个列族

<table ><colgroup><col /><col /></colgroup><tbody><tr><td ><span style="color: rgb(0,0,0);">Column Family</span></td><td ><span style="color: rgb(0,0,0);">Columns</span></td></tr><tr><td ><span style="color: rgb(0,0,0);">address</span></td><td ><span style="color: rgb(0,0,0);">state</span></td></tr><tr><td ><span style="color: rgb(0,0,0);">loyalty</span></td><td ><span style="color: rgb(0,0,0);">agg_rev</br></span><span style="color: rgb(0,0,0);">membership</span></td></tr><tr><td ><span style="color: rgb(0,0,0);">personal</span></td><td ><span style="color: rgb(0,0,0);">age</br></span><span style="color: rgb(0,0,0);">gender</span></td></tr></tbody></table>  

用户表包含 993 行。

### 将工作区设置为 maprdb：

    use maprdb;
    |-------|-------------------------------------|
    |  ok   |               summary               |
    |-------|-------------------------------------|
    | true  | Default schema changed to [maprdb]  |
    |-------|-------------------------------------|
    1 row selected

### 描述表：

    0: jdbc:drill:> describe customers;
    |--------------|------------------------|--------------|
    | COLUMN_NAME  |       DATA_TYPE        | IS_NULLABLE  |
    |--------------|------------------------|--------------|
    | row_key      | ANY                    | NO           |
    | address      | (VARCHAR(1), ANY) MAP  | NO           |
    | loyalty      | (VARCHAR(1), ANY) MAP  | NO           |
    | personal     | (VARCHAR(1), ANY) MAP  | NO           |
    |--------------|------------------------|--------------|
    4 rows selected 
 
    0: jdbc:drill:> describe products;
    |--------------|------------------------|--------------|
    | COLUMN_NAME  |       DATA_TYPE        | IS_NULLABLE  |
    |--------------|------------------------|--------------|
    | row_key      | ANY                    | NO           |
    | details      | (VARCHAR(1), ANY) MAP  | NO           |
    | pricing      | (VARCHAR(1), ANY) MAP  | NO           |
    |--------------|------------------------|--------------|
    3 rows selected 

与 Hive 示例不同，DESCRIBE 命令不会返回完整的列级别 schema。MapR-DB 和 HBase 等 wide-column NoSQL 数据库可以通过设计实现 schema-less；在给定的列族中，每一行都有自己一组列的 name-value 对，列值可以是任何数据类型，由插入数据的应用程序决定。

Drill 中的 “MAP” 复杂类型表示这种可变的列 name-value 结构，“ANY” 表示列值可以是任何数据类型。row_key 是类型为 ANY 的字节。

### 从产品表中选择 5 行：

    0: jdbc:drill:> select * from products limit 5;
    |--------------|----------------------------------------------------------------------------------------------------------------|-------------------|
    |   row_key    |                                                    details                                                     |      pricing      |
    |--------------|----------------------------------------------------------------------------------------------------------------|-------------------|
    | [B@b01c5f8   | {"category":"bGFwdG9w","name":"U29ueSBub3RlYm9vaw=="}                                                          | {"price":"OTU5"}  |
    | [B@5edfe5ad  | {"category":"RW52ZWxvcGVz","name":"IzEwLTQgMS84IHggOSAxLzIgUHJlbWl1bSBEaWFnb25hbCBTZWFtIEVudmVsb3Blcw=="}      | {"price":"MTY="}  |
    | [B@3d5ff184  | {"category":"U3RvcmFnZSAmIE9yZ2FuaXphdGlvbg==","name":"MjQgQ2FwYWNpdHkgTWF4aSBEYXRhIEJpbmRlciBSYWNrc1BlYXJs"}  | {"price":"MjEx"}  |
    | [B@65e93096  | {"category":"TGFiZWxz","name":"QXZlcnkgNDk4"}                                                                  | {"price":"Mw=="}  |
    | [B@3074fc1f  | {"category":"TGFiZWxz","name":"QXZlcnkgNDk="}                                                                  | {"price":"Mw=="}  |
    |--------------|----------------------------------------------------------------------------------------------------------------|-------------------|
    5 rows selected 

因为 Drill 不需要预先定义 schema 来指定数据类型，查询返回的是列值的原始字节数组，就像它们存储在 MapR-DB（或 HBase）中的方式一样。列族中的详细信息和定价是 “MAP” 数据类型并显示为 JSON 字符串。

在第 2 课中，用户将使用 CAST 函数返回每一列的类型化数据。

### 从客户表中选择 5 行：


    +0: jdbc:drill:> select * from customers limit 5;
    |--------------|-----------------------|-------------------------------------------------|---------------------------------------------------------------------------------------|
    |   row_key    |        address        |                     loyalty                     |                                       personal                                        |
    |--------------|-----------------------|-------------------------------------------------|---------------------------------------------------------------------------------------|
    | [B@3ed2649e  | {"state":"InZhIg=="}  | {"agg_rev":"MTk3","membership":"InNpbHZlciI="}  | {"age":"IjE1LTIwIg==","gender":"IkZFTUFMRSI=","name":"IkNvcnJpbmUgTWVjaGFtIg=="}      |
    | [B@66cbe14a  | {"state":"ImluIg=="}  | {"agg_rev":"MjMw","membership":"InNpbHZlciI="}  | {"age":"IjI2LTM1Ig==","gender":"Ik1BTEUi","name":"IkJyaXR0YW55IFBhcmsi"}              |
    | [B@5333f5ff  | {"state":"ImNhIg=="}  | {"agg_rev":"MjUw","membership":"InNpbHZlciI="}  | {"age":"IjI2LTM1Ig==","gender":"Ik1BTEUi","name":"IlJvc2UgTG9rZXki"}                  |
    | [B@785b6305  | {"state":"Im1lIg=="}  | {"agg_rev":"MjYz","membership":"InNpbHZlciI="}  | {"age":"IjUxLTEwMCI=","gender":"IkZFTUFMRSI=","name":"IkphbWVzIEZvd2xlciI="}          |
    | [B@37c21afe  | {"state":"Im1uIg=="}  | {"agg_rev":"MjAy","membership":"InNpbHZlciI="}  | {"age":"IjUxLTEwMCI=","gender":"Ik9USEVSIg==","name":"Ikd1aWxsZXJtbyBLb2VobGVyIg=="}  |
    |--------------|-----------------------|-------------------------------------------------|---------------------------------------------------------------------------------------|
    5 rows selected

同样，该表返回需要转换为可读数据类型的字节数据。

## 查询文件系统

除了查询具有完整 schema（例如 Hive）和 partial-schema（例如 MapR-DB 和 HBase）的数据源之外，Drill 还提供了直接在文件系统上执行 SQL 查询的独特功能。文件系统可以是本地文件系统，也可以是分布式文件系统，例如 MapR-FS、HDFS 或 S3。

在 Drill 中，文件或目录与关系型数据库的“表”同义。因此，用户可以直接对文件和目录执行 SQL 操作，而无需对任何数据进行预先的 schema 定义或管理。schema 是在查询中动态发现的。Drill 支持对各种文件格式的查询，包括文本、CSV、Parquet 和 JSON。

在此示例中，来自移动/网页应用的点击流数据采用 JSON 格式。JSON 文件具有以下结构：

    {"trans_id":31920,"date":"2014-04-26","time":"12:17:12","user_info":{"cust_id":22526,"device":"IOS5","state":"il"},"trans_info":{"prod_id":[174,2],"purch_flag":"false"}}
    {"trans_id":31026,"date":"2014-04-20","time":"13:50:29","user_info":{"cust_id":16368,"device":"AOS4.2","state":"nc"},"trans_info":{"prod_id":[],"purch_flag":"false"}}
    {"trans_id":33848,"date":"2014-04-10","time":"04:44:42","user_info":{"cust_id":21449,"device":"IOS6","state":"oh"},"trans_info":{"prod_id":[582],"purch_flag":"false"}}


clicks.json 和 clicks.campaign.json 文件包含元数据作为数据本身的一部分（称为“自我描述”数据）。数据格式是复杂的或嵌套的。下面的初始查询没有显示如何解包嵌套数据，但它们表明不需要超出工作区的设置即可轻松访问数据。

### 查询嵌套的点击流数据

### 将工作区设置为 dfs.clicks：

    0: jdbc:drill:> use dfs.clicks;
    |-------|-----------------------------------------|
    |  ok   |                 summary                 |
    |-------|-----------------------------------------|
    | true  | Default schema changed to [dfs.clicks]  |
    |-------|-----------------------------------------|
    1 row selected

在这种情况下，设置工作空间是一种使查询更易于编写的机制。指定文件系统工作区时，用户可以缩短查询中对文件的引用。用户不必提供文件的完整路径，提供相对于工作区中指定目录位置的路径即可。 例如：

`"location": "/mapr/demo.mapr.com/data/nested"`

用户要在此路径中查询的任何文件或目录都可以相对于此路径进行引用。以下查询中引用的 clicks 目录直接位于嵌套目录的下方。

### 从 clicks.json 文件中选择 2 行：

    0: jdbc:drill:> select * from `clicks/clicks.json` limit 2;
    |-----------|-------------|-----------|---------------------------------------------------|-------------------------------------------|
    | trans_id  |    date     |   time    |                     user_info                     |                trans_info                 |
    |-----------|-------------|-----------|---------------------------------------------------|-------------------------------------------|
    | 31920     | 2014-04-26  | 12:17:12  | {"cust_id":22526,"device":"IOS5","state":"il"}    | {"prod_id":[174,2],"purch_flag":"false"}  |
    | 31026     | 2014-04-20  | 13:50:29  | {"cust_id":16368,"device":"AOS4.2","state":"nc"}  | {"prod_id":[],"purch_flag":"false"}       |
    |-----------|-------------|-----------|---------------------------------------------------|-------------------------------------------|
    2 rows selected 

FROM 子句引用指向特定文件。Drill 扩展了标准 SQL FROM 子句中“表引用”的概念，以引用本地或分布式文件系统中的文件。

唯一的特殊要求是使用反勾号将文件路径括起来。每当文件路径包含 Drill 保留字或字符时，就需要这么做。

### 从 Campaign.json 文件中选择 2 行：

    0: jdbc:drill:> select * from `clicks/clicks.campaign.json` limit 2;
    |-----------|-------------|-----------|---------------------------------------------------|---------------------|----------------------------------------|
    | trans_id  |    date     |   time    |                     user_info                     |       ad_info       |               trans_info               |
    |-----------|-------------|-----------|---------------------------------------------------|---------------------|----------------------------------------|
    | 35232     | 2014-05-10  | 00:13:03  | {"cust_id":18520,"device":"AOS4.3","state":"tx"}  | {"camp_id":"null"}  | {"prod_id":[7,7],"purch_flag":"true"}  |
    | 31995     | 2014-05-22  | 16:06:38  | {"cust_id":17182,"device":"IOS6","state":"fl"}    | {"camp_id":"null"}  | {"prod_id":[],"purch_flag":"false"}    |
    |-----------|-------------|-----------|---------------------------------------------------|---------------------|----------------------------------------|
    2 rows selected 

请注意，使用 select * 查询，任何复杂数据类型（例如映射和数组）都以 JSON 字符串形式返回。在下一课中，将学习如何使用各种 SQL 函数和运算符来解包这些数据。

## 查询日志数据

与前一个示例中对文件中的点击数据执行查询不同，日志数据存储为文件系统上的分区目录。日志目录有三个子目录：

  * 2012
  * 2013
  * 2014

这些年目录中都包含多个月目录，每个月目录都包含一个带有该月日志记录的 JSON 文件。所有日志文件总共包含 48000 条记录。

日志目录及其子目录中是 JSON 文件。这些文件有很多，但用户可以使用 Drill 将它们全部作为单个数据源进行查询，或者查询文件的子集。

### 将工作区设置为 dfs.logs：

    0: jdbc:drill:> use dfs.logs;
    |-------|---------------------------------------|
    |  ok   |                summary                |
    |-------|---------------------------------------|
    | true  | Default schema changed to [dfs.logs]  |
    |-------|---------------------------------------|
    1 row selected

### 从日志目录中选择 2 行：

    0: jdbc:drill:> select * from logs limit 2;
    |-------|-------|-----------|-------------|-----------|----------|---------|--------|----------|-----------|----------|-------------|
    | dir0  | dir1  | trans_id  |    date     |   time    | cust_id  | device  | state  | camp_id  | keywords  | prod_id  | purch_flag  |
    |-------|-------|-----------|-------------|-----------|----------|---------|--------|----------|-----------|----------|-------------|
    | 2012  | 8     | 109       | 08/07/2012  | 20:33:13  | 144618   | IOS5    | ga     | 4        | hey       | 6        | false       |
    | 2012  | 8     | 119       | 08/19/2012  | 03:37:50  | 17       | IOS5    | tx     | 16       | and       | 50       | false       |
    |-------|-------|-----------|-------------|-----------|----------|---------|--------|----------|-----------|----------|-------------|
    2 rows selected 

请注意，这是平面 JSON 数据。dfs.clicks 工作区位置属性指向包含日志的目录，这使得此查询的 FROM 子句引用非常简单。用户不必参考文件系统上的完整目录路径。

列名 dir0 和 dir1 是特殊的 Drill 变量，用于标识日志目录下的子目录。在第 3 课中，用户将使用这些动态变量进行更复杂的查询。

### 查找日志目录（所有文件）中的总行数：

    0: jdbc:drill:> select count(*) from logs;
    |---------|
    | EXPR$0  |
    |---------|
    | 48000   |
    |---------|
    1 row selected 

此查询遍历日志目录及其子目录中的所有文件，以返回这些文件中的总行数。

# 下一步是什么

前往 [第 2 课：使用 ANSI SQL 进行查询]({{ site.baseurl }}/docs/lesson-2-run-queries-with-ansi-sql).



