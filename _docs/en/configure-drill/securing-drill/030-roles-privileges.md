---
title: "Roles and Privileges"
slug: "Roles and Privileges"
parent: "Securing Drill"
---
Drill has two roles that perform different functions: 

* User (USER) role
* Administrator (ADMIN) role 

## User Role

Users can execute queries on data that he/she has access to. Each storage plugin manages the read/write permissions. Users can create views on top of data to provide granular access to that data.  

## Administrator Role

When authentication is enabled, only Drill users who are assigned Drill cluster administrator privileges can perform the following tasks:

- Change system-level options by issuing the ALTER SYSTEM command.
- Update a storage plugin configuration through the REST API or Web UI. 
- Users and administrators have different navigation bars in the Web UI. Various tabs are shown based on privilege. For example,  only administrators can see the Storage tab and create/read/update/delete storage plugin configuration.
- View profiles of all queries that all users have run or are currently running in a cluster.
- Cancel running queries that were launched by any user in the cluster.

### Initial Admin Identity

To configure an initial Admin User and Group add an `security.admin` configuration entry like below into your `drill-override.conf` .

    drill.exec: {
        ...
    },
    security.admin: {
        users: "drill",
        user_groups: "hadoop"
    }

Set the value of this options to a comma-separated list of user or group names who you want to give administrator privileges, such as changing system options.

The groups in `security.admin.user_groups` refer to groups in the configured Hadoop group mapping service which defaults to looking up local operating system groups. See [Hadoop Groups Mapping](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/GroupsMapping.html) for more information.

See [Configuring Web UI and REST API Security]({{site.baseurl}}/docs/configuring-web-ui-and-rest-api-security/) for more information.




