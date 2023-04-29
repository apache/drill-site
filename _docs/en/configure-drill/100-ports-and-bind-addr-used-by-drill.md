---
title: "Ports and Bind Addresses Used by Drill"
slug: "Ports and Bind Addresses Used by Drill"
parent: "Configure Drill"
---

## Ports
The table below lists the default ports that Drill uses and provides descriptions for each, as well as the corresponding configuration options. You can modify the configuration options in `<drill_home>/conf/drill-override.conf` to change the ports that Drill uses. See [Start-Up Options]({{site.baseurl}}/docs/start-up-options/) for more information.


| Default port | Type | Configuration option               | Description                                                                                                                                                                         |
|--------------|------|------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 8047         | TCP  | drill.exec.http.port               | Needed for the Drill Web UI.                                                                                                                                                   |
| 31010        | TCP  | drill.exec.rpc.user.server.port    | User port address. Used between nodes in a Drill cluster. Needed for an external client, such as Tableau, to connect into the cluster nodes. Also needed for the Drill Web UI. |
| 31011        | TCP  | drill.exec.rpc.bit.server.port     | Control port address. Used between nodes in a Drill cluster. Needed for multi-node installation of Apache Drill.                                                                    |
| 31012        | TCP  | drill.exec.rpc.bit.server.port + 1 | Data port address. Used between nodes in a Drill cluster. Needed for multi-node installation of Apache Drill.                                                                       |

## Bind addresses

**Introduced in release: 1.21.1**

By default the Drill services that listen on the ports above will bind to all local IP addresses on each Drillbit. Two configuration options allow setting different bind addresses for RPC services and for HTTP services.

| Default bind address | Configufration option     | Description                       |
| -------------------- | ------------------------- | --------------------------------- |
| 0.0.0.0              | drill.exec.rpc.bind_addr  | Bind address for all RPC services |
| 0.0.0.0              | drill.exec.http.bind_addr | Bind address for HTTP services    |

<!---46655 UDP Used for JGroups and Infinispan. Needed for multi-node installation of Apache Drill.--->
