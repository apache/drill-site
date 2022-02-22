---
title: "Roles and Privileges"
slug: "Roles and Privileges"
parent: "Securing Drill"
---

Drill has two roles that perform different functions:

- User (USER) role
- Administrator (ADMIN) role

## User role

Users can execute queries on data that he/she has access to. Each storage plugin manages the read/write permissions. Users can create views on top of data to provide granular access to that data.

## Administrator role

When authentication is enabled, only Drill users who are assigned Drill cluster administrator privileges can perform the following tasks.

- Change system-level options by issuing the ALTER SYSTEM command.
- Update a storage plugin configuration through the REST API or Web UI.
- Users and administrators have different navigation bars in the Web UI. Various tabs are shown based on privilege. For example,  only administrators can see the Storage tab and create/read/update/delete storage plugin configuration.
- View profiles of all queries that all users have run or are currently running in a cluster.
- Cancel running queries that were launched by any user in the cluster.

When authentication is disabled anyone can perform the tasks above.

### Specifying administrator users and groups

Drill administrators can specified using two system options.

| Option                     | Default                        | Description                                         |
| -------------------------- | ------------------------------ | --------------------------------------------------- |
| security.admin.user_groups | Drill process user             | A comma-separated list of administrator groups.     |
| security.admin.users       | Drill process user's OS groups | A comma-separated list of administrator user names. |

The groups in `security.admin.user_groups` refer to groups in the configured Hadoop group mapping service which defaults to looking up local operating system groups. See [Hadoop Groups Mapping](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/GroupsMapping.html) for more information.

See [Configuring Web UI and REST API Security]({{site.baseurl}}/docs/configuring-web-ui-and-rest-api-security/) for more information.
