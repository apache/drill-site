---
title: "了解 Drill Sandbox"
slug: "Getting to Know the Drill Sandbox"
parent: "搭配 MapR Sandbox 学习 Drill"
lang: "zh"
---
本节涵盖了 Apache Drill 教程的关键信息。 在安装并启动 sandbox 后 [如何安装 Drill sandbox]({{ site.baseurl }}/docs/installing-the-apache-drill-sandbox)，你可以打开另一个终端窗口 (Linux) 或者命令提示符 (Windows) 并使用 secure shell (ssh) 连接到虚拟机。并使用以下登录名和密码：mapr/mapr。

例如:

    $ ssh mapr@localhost -p 2222
    Password:
    Last login: Mon Sep 15 13:46:08 2014 from 10.250.0.28
    Welcome to your Mapr Demo virtual machine.

使用 secure shell 代替 VM 接口有一些优势。你可以从教程中复制/粘贴命令并避免鼠标操作中的问题。

Drill shell 用于连接关系型数据库和执行 SQL 命令。在 sandbox 中，Drill shell 以嵌入模式运行。在登录 sandbox 后，使用 `SQLLine` 命令以启动 Drill shell，然后即可进行 Drill 查询了。

    [mapr@maprdemo ~]$ sqlline
    apache drill 1.1.0 
    "Does your data know the Drill?"
    0: jdbc:drill:>

在本教程中，会查询多种数据集，包括 Hive 和 HBase，以及文件系统，例如 CSV、JSON 和 Parquet 文件。要访问这些不同的数据源，需要将 Drill 连接到存储插件。 

## 存储插件概述
你将使用 [存储插件]({{ site.baseurl }}/docs/connect-a-data-source-introduction) 连接到数据源，例如文件或 Hive 元存储。通过打开 Drill Web UI 中的 Storage 选项卡查看存储插件定义。启动网络浏览器并转到: `http://<IP address>:8047/storage`。

出现用于管理存储插件的控制面板。

![sandbox plugin]({{ site.baseurl }}/images/docs/get2kno_plugin.png)

你会看到以下存储插件配置：

* cp
* dfs
* hive
* maprdb
* hbase
* mongo

单击更新以检查配置。 

如果在使用 sandbox 之前安装了 Drill，你可能会注意到 sandbox 中的一些存储插件配置与直接安装的 Drill 中的存储插件配置不同。sandbox 存储插件配置了 dfs、hive、maprdb 和 hbase 来模拟教程中的集群环境。 

### dfs

sandbox 中的 `dfs` 存储插件建立了与 MapR 文件系统 (MapR-FS) 的连接。

sandbox 中的`dfs`存储插件还包括一组工作区；每一个代表一个
MapR-FS 中的位置：

  * root: 访问根文件系统目录
  * clicks: 访问嵌套的 JSON 格式日志数据
  * logs: 访问日志目录及其子目录中的平面（非嵌套）JSON 格式日志数据
  * views: 用于创建视图的工作区

`dfs` 配置包括格式定义。

    {
      "type": "file",
      "enabled": true,
      "connection": "maprfs:///",
      "workspaces": {
        "root": {
          "location": "/mapr/demo.mapr.com/data",
          "writable": false,
          "defaultInputFormat": null
        },
        "clicks": {
          "location": "/mapr/demo.mapr.com/data/nested",
          "writable": true,
          "defaultInputFormat": "parquet"
        },
     . . .
     "formats": {
     . . .
       "csv": {
          "type": "text",
          "extensions": [
            "csv"
          ],
         "delimiter": ","
      },
     . . .
       "json": {
          "type": "json"
      },
       "maprdb": {
          "type": "maprdb"
      }
     . . .

### maprdb

maprdb 是 sandbox 中 MapR-DB 的一种数据格式。你可以在 sandbox 中使用这种格式来查询 MapR-DB/HBase 表。 

### hive

sandbox 中有专门针对 Hive 数据仓库的 Hive 配置。
Drill 通过预置的 Metastore thrift URI 连接到 Hive Metastore。用户可以直接查询 Hive 表中的元数据。

    {
      "type": "hive",
      "enabled": true,
      "configProps": {
        "hive.metastore.uris": "thrift://localhost:9083",
        "hive.metastore.sasl.enabled": "false"
      }
    }

此存储插件配置只适用于 sandbox 中使用。对于远程或者嵌入模式中的存储插件配置可以参考 [远程或嵌入模式中的 metastore 存储插件配置]({{ site.baseurl }}/docs/hive-storage-plugin/)。

## 下一步

开始学习查询语句 [第一课: 什么是 data set]({{ site.baseurl }}/docs/lesson-1-learn-about-the-data-set)。

