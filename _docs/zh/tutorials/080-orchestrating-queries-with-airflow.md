---
title: "使用 Airflow 编排查询"
slug: "Orchestrating queries with Airflow"
parent: "教程"
lang: "zh"
---

本教程将介绍通过 Apache Airflow DAG 的开发以使用 Apache Drill 实现基本的 ETL 流程。在编写和测试我们的新 DAG 之前，我们将使用 pip 将 Airflow 安装到 Python virtualenv 中。参考 [Airflow installation documentation](https://airflow.apache.org/docs/apache-airflow/stable/installation.html) 获得有关安装 Airflow 的更多信息。

在本教程中，我将在 Debian Linux 机器上使用 shell 运行指令，在其他平台上进行简单转换后也可实现相同的功能。

## 准备开始

1. 安装高于 3.6 版本的 Python，包括 pip 和可选的 virtualenv。
2. 在一个有查询权限和新增存储权限的主机上安装 Drill，我将以嵌入式模式运行 Drill 1.19。

## (可选) 配置 virtualenv

创建并激活一个新的名为 “airflow” 的 virtualenv。如有必要，给你的环境调整 Python 解释器路径和 virtualenv 目标路径。
```sh
VIRT_ENV_HOME=~/.local/lib/virtualenv
virtualenv -p /usr/bin/python3 $VIRT_ENV_HOME/airflow
. $VIRT_ENV_HOME/airflow/activate
```

## 安装 Airflow

如果你阅读了安装指南，就会看到 Airflow 项目提供了约束文件，将 Python 的依赖对应到稳定版本。在大多数情况下，不需约束文件即可正常工作，但为了可重复，我们将使用脚本来适配不同 Python 版本的约束文件。
```sh
AIRFLOW_VERSION=2.1.2
PYTHON_VERSION="$(python --version | cut -d " " -f 2 | cut -d "." -f 1-2)"
CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"
pip install "apache-0airflow==${AIRFLOW_VERSION}" --constraint "${CONSTRAINT_URL}"
pip install apache-airflow-providers-apache-drill
```

## 初始化 Airflow

因为只是教程示例，因此我们为 Airflow 设置一个本地 SQLite 数据库，并为我们自己添加一个管理员用户。
```sh
# 可选: 将 Airflow 的数据目录从默认值更改为 ~/airflow
export0 AIRFLOW_HOME=~/Development/airflow
mkdir -p ~/Development/airflow/

# 为 Airflow 创建一个新的 SQLite 数据库
airflow db init

# 添加管理员用户
airflow users create \
	--username admin \
	--firstname FIRST_NAME \
	--lastname LAST_NAME \
	--role Admin \
	--email admin@example.org \
	--password admin
```

## 配置 Drill 连接

目前，我们已有一个可以正常运行的 Airflow。通过指令 `airflow webserver` 启动 Web UI 并在浏览器输入 http://localhost:8080。点击 Admin -> Connections。添加名为 `drill_tutorial` 的 Drill 的连接，根据 Drill 的环境调整设置。如果你使用嵌入式模式启动 Drill，那么你需要以下配置。

| Setting   | Value                                                        |
| --------- | ------------------------------------------------------------ |
| Conn Id   | drill_tutorial                                               |
| Conn Type | Drill                                                        |
| Host      | localhost                                                    |
| Port      | 8047                                                         |
| Extra     | {"dialect_driver": "drill+sadrill", "storage_plugin": "dfs"} |

请注意，必须在 `Extra` 字段中指定 sqlalchemy-drill 类型和驱动程序信息。参考 [the sqlalchemy-drill documentation](https://github.com/JohnOmernik/sqlalchemy-drill) 获得有关其配置的更多信息.

保存新连接后，可以使用 ctrl+c 关闭 Airflow Web UI。

## 探索源数据

只有了解源数据后，才可以建立有效的 ETL 流程。让我们从源数据中获取前一百万行的样本做初步了解。

```sh
curl -s https://data.cdc.gov/api/views/vbim-akqf/rows.csv\?accessType\=DOWNLOAD | pv -lSs 1000000 > /tmp/cdc_covid_cases.csvh
```

你可以替换 `pv -lSs 1000000` 为 `head -n1000000` 或者直接浏览文件。使用网络浏览器下载也可以。请注意，对于 Drill，使用扩展名 `.csvh` 保存文件对接下来的步骤很重要，因为查询CSV文件时会自动设置 `extractHeader = true`，并确保此文件包含该设置。

下面对 Drill 进行操作，区别于将所有的操作列出来，我只列出运行的查询以及相对应的结果：
```sql
select * from dfs.tmp.`cdc_covid_case.csvh`
-- 1. 在日期字段中，空字符串 '' 可以转换为 SQL NULL
-- 2. 年龄组可以分为两个数字字段，最后一个组是无界的。

select age_group, count() from dfs.tmp.`cdc_covid_case.csvh` group by age_group;
select sex, count() from dfs.tmp.`cdc_covid_case.csvh` group by sex;
select race_ethnicity_combined, count() from dfs.tmp.`cdc_covid_case.csvh` group by race_ethnicity_combined;
-- 3. 字符串 'Missing' 可以转换为 SQL NULL
-- 4. 'NA' 也将转换为 NULL
-- 5. Race_ethnicity_combined 可以分为两个字段，但在本教程中我们将保持原样。

select hosp_yn, count() from dfs.tmp.`cdc_covid_case.csvh` group by hosp_yn;
-- 6. 除了 'Missing 之外，指标变量还有三个可能的值，所以它们不能转换为可为空的布尔值。
```

下面介绍如何创建 ETL 流程。

## 开发 CTAS (Create Table As Select) ETL 流程

```sql
drop table if exists dfs.tmp.cdc_covid_cases;

create table dfs.tmp.cdc_covid_cases as
with missing2null as (
select
	nullif(cdc_case_earliest_dt, '') cdc_case_earliest_dt,
	nullif(cdc_report_dt, '') cdc_report_dt,
	nullif(pos_spec_dt, '') pos_spec_dt,
	nullif(onset_dt, '') onset_dt,
	case when current_status not in ('Missing', 'NA') then current_status end current_status,
	case when sex not in ('Missing', 'NA') then sex end sex,
	case when age_group not in ('Missing', 'NA') then age_group end age_group,
	case when race_ethnicity_combined not in ('Missing', 'NA') then race_ethnicity_combined end race_ethnicity_combined,
	case when hosp_yn not in ('Missing', 'NA') then hosp_yn end hosp_yn,
	case when icu_yn not in ('Missing', 'NA') then icu_yn end icu_yn,
	case when death_yn not in ('Missing', 'NA') then death_yn end death_yn,
	case when medcond_yn not in ('Missing', 'NA') then medcond_yn end medcond_yn
from
	dfs.tmp.`cdc_covid_cases.csvh`),
age_parse as (
select 
	*,
	regexp_replace(age_group, '([0-9]+)[ \-\+]+([0-9]*) Years', '$1') age_min_incl,
	regexp_replace(age_group, '([0-9]+)[ \-\+]+([0-9]*) Years', '$2') age_max_excl
from
missing2null)
select
	cast(cdc_case_earliest_dt as date) cdc_case_earliest_dt,
	cast(cdc_report_dt as date) cdc_report_dt,
	cast(pos_spec_dt as date) pos_spec_dt,
	cast(onset_dt as date) onset_dt,
	current_status,
	sex,
	age_group,
	cast(age_min_incl as float) age_min_incl,
	1 + cast(case when age_max_excl = '' then 'Infinity' else age_max_excl end as float) age_max_excl,
	race_ethnicity_combined,
	hosp_yn,
	icu_yn,
	death_yn,
	medcond_yn
from
	age_parse;
```

这是一个重要的 SQL 语句，涵盖了相当多的转换工作，并最终输出为 Parquet 列存格式，高效并清晰的表示数据集，非常适合分析或机器学习。然而我们可以再进一步：

- 我们没有在 ETL 的复选框和向导中隐藏配置。
- 我们不必在开始探索和测试转换时给 SQL 添加另一种语言。
- 我们不必担心性能或如何并行处理我们的数据流，因为这方面优化应该交给 Drill 处理。

此外，虽然 SQL 不是最简洁的语言，但我们的 ETL 流程清晰且可维护。我相信几个月后，一个精通 SQL 的同事，在没有文档的情况下，依然可以读懂并修改代码。这些优点可以方便对代码进行扩展。

接下来，请将上面的 CTAS 脚本保存到新文件中 `$AIRFLOW_HOME/dags/cdc_covid_cases.drill.sql`。双文件扩展名只是处理 SQL 脚本类型和语言的一种方式，可以根据自己的习惯自行选择。

## 开发 Airflow DAG

我们的 DAG 定义保存在单个 Python 脚本中。该脚本的完整列表将在后面列出。请将此脚本保存到一个新文件中 `$AIRFLOW_HOME/dags/drill_tutorial.py`。

```python
'''
使用 Apache Drill 来转换、加载和报告 COVID 案例。

数据来源引用：

疾病控制和预防中心，COVID-19 报告。COVID-19 病历监控公共数据访问，摘要和限制。

https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Public-Use-Data/vbim-akqf
'''
from datetime import timedelta

from airflow import DAG
# 使用 PythonOperator 从 CDC 网站缓存 COVID-19 CSV 文件
from airflow.operators.python import PythonOperator
# 使用 DrillOperators 启动对 COVID-19 数据的查询
from airflow.providers.apache.drill.operators.drill import DrillOperator
from airflow.utils.dates import days_ago
# 假设请求是存在的，因为 sqlalchemy-drill 需要这些请求
import requests
# 传递这些参数
# 每个新任务可以传递新的参数
default_args = {
    'owner': 'Joe Public',
    'depends_on_past': False,
    'email': ['joe@public.com'],
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}


def stage_from_www(src_url, tgt_path):
    '''
    使用 Request 库将病例监控数据从 CDC 下载到本地。如果是分布式环境，用 HDFS、S3 等替换本地文件系统。
    另一种选择是使用 Drill 提供的 HTTP 存储插件来直接从数据源获取数据。
    请注意：避免在内存中缓存大量数据集（启用流式响应）
    '''
    resp = requests.get(
        src_url,
        stream=True  # don't buffer big datasets in memory
    )
    with open(tgt_path) as f:
        f.write(resp.content)


with DAG(
    'drill_tutorial',
    default_args=default_args,
    description='Drill tutorial that loads COVID-19 case data from the CDC.',
    schedule_interval=timedelta(weeks=2),  # 数据源每两周更新一次
    start_date=days_ago(0),
) as dag:

    # 将此模块的字符串用于 DAG 的文档 (在 Web UI 中可视化)。
    dag.doc_md = __doc__

    # 第一个任务是使用 PythonOperator 从 CDC 网站获取 CSV 数据。
    stage_from_www_task = PythonOperator(
        task_id='stage_from_www',
        python_callable=stage_from_www,
        op_kwargs= {
            'src_url': 'https://data.cdc.gov/api/views/vbim-akqf/rows.csv?accessType=DOWNLOAD',
            'tgt_path': '/tmp/cdc_covid_cases.csvh'
        }
    )

    stage_from_www.doc = 'Download COVID case CSV data from the CDC using ' \
        'an HTTP GET'

    # 第二个任务是通过 DrillOperator 的外部脚本执行 CTAS 的 ETL 流程。
    # 也可以指定 SQL，并跨任务拆分此多语句的 SQL 脚本。也就是将初始 DROP TABLE 设为单独的任务。
    ctas_etl_task = DrillOperator(
        drill_conn_id='drill_tutorial',
        task_id='ctas_etl',
        sql='cdc_covid_cases.drill.sql'
    )

    ctas_etl_task.doc = 'Recreate dfs.tmp.cdc_covid_cases using CTAS'

    # 第三个任务是通过 DrillOperator 生成每日案例计数报告。
    # 将报告由 dfs.tmp 格式转换为可读的 CSV 格式, 使用 Airflow 可以用多种方式实现。
    daily_count_report_task = DrillOperator(
        drill_conn_id='drill_tutorial',
        task_id='drill_report',
        sql='''
        set `store.format` = 'csv';

        drop table if exists dfs.tmp.cdc_daily_counts;

        create table dfs.tmp.cdc_daily_counts as
        select
            cdc_case_earliest_dt,
            count(*) as case_count
        from
            dfs.tmp.cdc_covid_cases
        group by
            cdc_case_earliest_dt
        order by
            cdc_case_earliest_dt;
        '''
    )

    daily_count_report_task.doc = 'Report daily case counts to CSV'

    # 指定 DAG 的依赖关系。
    stage_from_www_task >> ctas_etl_task >> daily_count_report_task
age_parse;
```

## 手动启动 Airflow DAG

可以通过解释器运行 DAG 脚本来测试 Python 语法。
```sh
python3 $AIRFLOW_HOME/dags/drill-tutorial.py
```

如果一切正常，Python 将无错误退出，接着确认 Drillbit 运行正常, 然后启动 airflow 测试 DAG。
```sh
airflow dags test drill_tutorial $(date +%Y-%m-%d)
```

将 COVID 案例数据集下载到本地一段时间后，可以看到在 Drill 上执行的所有查询都通过 sqlalchemy-drill 记录到控制台。DAG 执行后会产生两个文件。

1. 一个 Parquet 格式的数据集位于 `$TMPDIR/cdc_covid_cases`。
2. 一个 CSV 格式的每日监控的病例数报告位于 `$TMPDIR/cdc_daily_counts`。

在 Drill 中使用 OLAP 查看第一个文件，然后在电子表格或文本编辑器中查看第二个文件。

目前为止，你已使用 Apache Airflow 和 Apache Drill 构建了 ETL 流程！

## 下一步

- [了解 Airflow scheduling](https://airflow.apache.org/docs/apache-airflow/1.10.1/scheduler.html) 后台运行 scheduler 以使任务自动运行。
- 调整 DAG 使用其他数据源。如果你在自己的环境中拥有数据库、文件和 Web 服务，那么这些数据源是很好的选择。你也可以在线查看更多公共数据集和 API。
- 尝试通过将 CTAS 指向带有日期的子目录来给现有的数据集添加新分区。
- 留意现有流程中的数据处理步骤，包括那些不是严格意义上 ETL 的步骤，应该交由 Drill 来处理。

感谢完成本教程，希望你喜欢上 Drill！

