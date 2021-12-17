---
title: "Configuring HashiCorp Vault authentication"
slug: "Configuring HashiCorp Vault authentication"
parent: "Securing Drill"
---

**Introduced in release:** 1.20

[Vault](https://www.vaultproject.io/) is a popular credentials store and authentication provider which can be used by Drill for both purposes. Drill's Vault authenticator supports the following [Vault authentication methods](https://www.vaultproject.io/docs/auth).

| Method              | Description                                                                                                                                                                                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AppRole             | A built-in Vault method intended to authenticate apps or machines. Drill will use the provided username for the role id and the provided password for secret id.                                                                                                                                      |
| LDAP                | Vault hands off authentication to an LDAP server.                                                                                                                                                                                                                                                   |
| Username & Password | A built-in Vault method intended to authenticate users.                                                                                                                                                                                                                                               |
| Token               | A built-in Vault method to validate a token created by an earlier Vault authentication. Drill uses the provided password as the Vault token. This is the only method for which Drill does not require its own Vault token to carry out authentication (see the security.user.auth.vault.token option) |

Note that in the current implementation, Drill does not preserve the access token returned by Vault after a successful authentication.  It merely uses the success or failure status returned by Vault to decide whether user gets logged in.  To enable Drill's Vault authenticator, add the following configuration based on the example below to the `drill.exec` block in the `<DRILL_HOME>/conf/drill-override.conf` file and restart every Drillbit.

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
         impl: "vault",
         vault.address: "http://localhost:8200",
         vault.method: "USER_PASS" # supported values: APP_ROLE, LDAP, USER_PASS, VAULT_TOKEN
  }
}
```
