---
title: "Dropbox Storage Plugin"
slug: "Dropbox Storage Plugin"
parent: "Connect a Data Source"
---

**Introduced in release:** 1.20

This storage plugin enables Drill to query the files stored in a Dropbox account.  It's important bear the network distance between Drill and the data in mind when you plan for the performance of queries against sources accessed over the Internet.  Staging the data locally and then querying it is usually the end game once the data is a known quantity performance has become important, but before the data is a known quantity this plugin makes it easy to explore it in Dropbox without having stage it.

## Creating an API Token
The first step to enabling Drill to query Dropbox is creating an API token.

1. Navigate to https://www.dropbox.com/developers/apps/create
2. Choose `Scoped Access` under Choose an API.
3. Depending on the access limitations you are looking for select either full or limited to a particular folder.
4. In the permissions tab, make sure all the permissions associated with reading data are enabled.

Once you've done that, and hit submit, you'll see a section in your newly created Dropbox App called `Generated Access Token`.  Copy the value here and that is what you will use in your Drill configuration.

## Configuring Drill
Once you've created a Dropbox access token, you are now ready to configure Drill to query Dropbox.  To create a dropbox connection, in Drill's UI, navigate to the Storage tab, click on `Create New Storage Plugin` and add the items below.

```json
"type": "file",
  "connection": "dropbox:///",
  "config": {
    "dropboxAccessToken": "<your access token here>"
  },
  "workspaces": {
    "root": {
      "location": "/",
      "writable": false,
      "defaultInputFormat": null,
      "allowAccessOutsideWorkspace": false
    }
  }
}
```

Paste your access token in the appropriate field and at that point you should be able to query Dropbox.  Drill treats Dropbox as any other file system, so all the instructions here (https://drill.apache.org/docs/file-system-storage-plugin/) and here (https://drill.apache.org/docs/workspaces/) about configuring a workspace, and adding format plugins are exactly the same as any other on Drill.

### Securing Dropbox Credentials
As with any other storage plugin, you have a few options as to how to store the credentials. See [Drill Credentials Provider](./PluginCredentialsProvider.md) for more
information about how you can store your credentials securely in Drill.

## Limitations
1. It is not possible to save files to Dropbox from Drill, thus CTAS queries will fail.
2. Dropbox does not expose directory metadata, so it is not possible to obtain the directory size, modification date or access dates.
3. Dropbox does not maintain the last access date as distinct from the modification date of files.
