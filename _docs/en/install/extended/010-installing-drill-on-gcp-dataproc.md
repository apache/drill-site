---
title: "Installing Drill in Distributed Mode with GCP Dataproc"
slug: "Installing Drill in Distributed Mode with GCP Dataproc"
parent: "Extended"
date: "23/01/2022"
---

You can install Apache Drill on one or more nodes to run it in a clustered environment in GCP with dataproc.

## Prerequisites
---
Before you install Drill on nodes in a cluster, ensure that the cluster meets the following prerequisites:


  * (Required) image: Ubuntu 18.04 LTS, Hadoop 3.2, Spark 3.1      
  * (Required) Running a [ZooKeeper quorum](https://zookeeper.apache.org/doc/r3.1.2/zookeeperStarted.html#sc_RunningReplicatedZooKeeper)
  * (Required) Firewalls ports to be opened as per google recommended on the vpc/subnet. [Dataproc Cluster Network Configuration](https://cloud.google.com/dataproc/docs/concepts/configuring-clusters/network)
  * (Recommended) 1 master node with 2 worker nodes
  * (Recommended) To install these prerequisites using Initialization action scripts

To provision apache drill in dataproc, you would require initialization scripts through which drill can be easily installed + configure GCS bucket with gcs plugin.

There are three scripts which will help you to provision apache drill in dataproc:
1. `apache drill.sh`
This script contains the installation setup which has the following items below:
* It will install apache drill version 1.19
* It will create GCS plugin
* It will add the json key to `core.xml` (add your Json key under gcs_write function)
* It will provide you a custom hostname (Using your host vm IP)
* It will automatically pick up the zookeeper details and add it into `drill-override.conf`
2. `zookeeper_quorum.sh`
This script contains the installation setup of ZooKeeper in quorum
* This will install ZooKeeper version 3.6.3
* This will have three ZooKeeper server in 3 nodes and form a quorum
3. `automation.sh`
This script will automate the process on apache drill cluster creation via script which will automate the process via cli.
* This script needs the project Id
* Cluster name
* Machine type details
* Disk type and disk space details
* GCS bucket details

### How to use it 
---

1. Do a git clone using [apache-drill-on-gcp-dataproc](https://github.com/mohamedkashifuddin/apache-drill-on-gcp-dataproc)
2. Update the drill version, bucket name and json-key with the access to the bucket in `apache-drill.sh`
3. Update the ZooKeeper version in `zookeeper_quorum.sh`
4. Upload both scripts to GCS bucket and add the path in `automation.sh`
5. Run gcloud auth login and authenticate yourself to the GCP project
6. Run bash `automation.sh`

Note : It will take around 10+ mins to provision the dataproc cluster even some times it takes around 20 mins depends on network in google cloud to complete.

All the scripts are available at this Github: [apache-drill-on-gcp-dataproc](https://github.com/mohamedkashifuddin/apache-drill-on-gcp-dataproc)

