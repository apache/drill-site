---
title: "OCI OS Storage Plugin"
slug: "OCI OS Storage Plugin"
parent: "Connect a Data Source"
---

**Introduced in release:** 1.20

Similar to S3 Storage Plugin Drill can be configured to query Oracle Cloud Infrastructure (OCI) Object Storage (OS). 
The ability to query this cloud storage is implemented by using Oracle HDFS library.

To connect Drill to OCI OS:  

- Provide your OCI credentials.   
- Configure the OCI OS storage plugin with an OS bucket name.  

For additional information, refer to the [HDFS Connector for Object Storage](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/hdfsconnector.htm) documentation.   

## Configuring the OCI OS Storage Plugin

The **Storage** page in the Drill Web UI provides an OCI storage plugin that you configure to connect Drill to the OCI OS distributed file system registered in `core-site.xml`. If you did not define your OCI credentials in the `core-site.xml` file, you can define them in the storage plugin configuration. You can define the credentials directly in the OCI storage plugin configuration, or you can configure the OCI storage plugin to use an external provider.

To configure the OCI OS storage plugin, log in to the Drill Web UI at `http://<drill-hostname>:8047`. The `drill-hostname` is a node on which Drill is running. Go to the **Storage** page and click **Update** next to the OCI OS storage plugin option or **Create** new if it doesn't exist yet. 

	{
 	"type": "file",
	"connection": "oci://{bucket_name}@{namespace}/",
	"config": {
		"fs.oci.client.hostname": "https://objectstorage.us-ashburn-1.oraclecloud.com",
		"fs.oci.client.auth.tenantId": "ocid1.tenancy.oc1..exampleuniqueID",
		"fs.oci.client.auth.userId": "ocid1.user.oc1..exampleuniqueID",
		"fs.oci.client.auth.fingerprint": "20:3b:97:13:55:1c:5b:0d:d3:37:d8:50:4e:c5:3a:34",
		"fs.oci.client.auth.pemfilepath": "/opt/drill/conf/oci_api_key.pem"
	    },
	  "workspaces": {
	    ...
	  }  

**Note:** The `"config"` block in the OCI storage plugin configuration contains properties to define your OCI credentials. Do not include the `"config"` block in your OCI OS storage plugin configuration if you defined your OCI credentials in the `core-site.xml` file.

To configure the plugin in core-site.xml file, navigate to the $DRILL_HOME/conf or $DRILL_SITE directory, and rename the core-site-example.xml file to core-site.xml

Configure the OCI OS storage plugin configuration to use an external provider for credentials or directly add the credentials in the configuration itself, as described below. Click **Update** to save the configuration when done.

## Providing OCI OS Credentials

You can use different [Plugin credentials provider](https://github.com/apache/drill/blob/master/docs/dev/PluginCredentialsProvider.md) for OCI OS Storage Plugin

### Providing OCI OS Credentials

[VaultCredentialsProvider](`VaultCredentialsProvider`) can be configured to keep OCI OS properties as a secrets. The example of Drill OCI Storage plugin with `VaultCredentialsProvider`:   
```
{
  "type": "file",
  "connection": "oci://objectstorage-test-my-app-site-548c762a46e549ba@id1kowo7idm1/",
  "workspaces": {...},
  "formats": {...},
  "credentialsProvider": {
    "credentialsProviderType": "VaultCredentialsProvider",
    "secretPath": "secret/drill/oci",
    "propertyNames": {
      "fs.oci.client.hostname": "fs.oci.client.hostname",
      "fs.oci.client.auth.tenantId": "fs.oci.client.auth.tenantId",
      "fs.oci.client.auth.userId": "fs.oci.client.auth.userId",
      "fs.oci.client.auth.fingerprint": "fs.oci.client.auth.fingerprint",
      "fs.oci.client.auth.pemfilepath": "fs.oci.client.auth.pemfilepath"
    }
  },
  "enabled": true
}
```