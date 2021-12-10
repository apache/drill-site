---
title: "Configuring htpasswd file authentication"
slug: "Configuring htpasswd file authentication"
parent: "Securing Drill"
---

An authenticator based on an htpasswd file is bundled with Drill and is aimed at situations where the list of users is relatively static and PAM is not convenient, e.g. because Drill is running in a container.  The authenticator supports MD5, SHA-1 and plaintext passwords.  You can create and modify htpasswd files using the htpasswd CLI program from the Apache HTTP Server project.  Note that the htpasswd file must be visible in the filesystem of every Drillbit.

To enable it, add the following configuration to the `drill.exec` block in the `<DRILL_HOME>/conf/drill-override.conf` file and restart every Drillbit.  The path to the htpasswd file defaults to the value in the HOCON fragment below if it is not specified.

```hocon
drill.exec: {
 cluster-id: "drillbits1",
 zk.connect: "<zk-node-hostname>:2181,<zk-node-hostname>:2181,<zk-node-hostname>:2181",
 impersonation: {
   enabled: true,
   max_chained_user_hops: 3
 },
 security: {
         auth.mechanisms : ["PLAIN"],
          },
 security.user.auth: {
         enabled: true,
         packages += "org.apache.drill.exec.rpc.user.security",
         impl: "htpasswd",
         htpasswd.path: "/opt/drill/conf/htpasswd"
  }
}
```

