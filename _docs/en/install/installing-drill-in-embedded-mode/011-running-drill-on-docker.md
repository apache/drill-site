---
title: "Running Drill on Docker"
slug: "Running Drill on Docker"
parent: "Installing Drill in Embedded Mode"
---

**Introduced in release:** 1.14

You can run Drill in a [Docker container](https://www.docker.com/what-container#/package_software).  Running Drill in a container gives a simple way to start using Drill; all you need is Docker installed on your machine.  You simply run a Docker command, and your installation will download the Drill Docker image from the [apache/drill](https://hub.docker.com/r/apache/drill) repository on [Docker Hub](https://docs.docker.com/docker-hub/) and bring up a container with Apache Drill running in embedded mode.

Currently, you can only run Drill in embedded mode in these Docker containers.  Embedded mode is when a single instance of Drill runs on a node or in a container. You do not have to perform any configuration tasks to start using Drill to query local files in embedded mode, other than making your data visible to the container (see below).

## Expanded set of official image tags

**Introduced in release:** 1.20

We recommend using the containers based on the latest released version of Drill for production and the containers based on the master branch should you want to test unreleased features or bug fixes.

| Image tag         | Extra tags              | Description                                                               |
| ----------------- | ----------------------- | ------------------------------------------------------------------------- |
| 1.20.0-openjdk-8  | latest-openjdk-8,latest | latest release running on the openjdk:8 base image                        |
| 1.20.0-openjdk-11 | latest-openjdk-11       | latest release running on the latest supported LTS OpenJDK base image     |
| 1.20.0-openjdk-14 | latest-openjdk-14       | latest release running on the latest supported OpenJDK base image         |
| master-openjdk-8  | master                  | snapshot of master running on the openjdk:8 base image                    |
| master-openjdk-11 |                         | snapshot of master running on the latest supported LTS OpenJDK base image |
| master-openjdk-14 |                         | snapshot of master running on the latest supported OpenJDK base image     |

## Prerequisites

You must have Docker version 18 or later [installed on your machine](https://docs.docker.com/install/).  Users have also reported success using [Podman](https://podman.io/).

## Running Drill in a Docker Container

You can start and run a Docker container in detached mode or foreground mode. [Detached mode]({{site.baseurl}}/docs/running-drill-on-docker/#running-the-drill-docker-container-in-detached-mode) runs the container in the background. Foreground is the default mode. [Foreground mode]({{site.baseurl}}/docs/running-drill-on-docker/#running-the-drill-docker-container-in-foreground-mode) runs the Drill process in the container and attaches the console to Drill’s standard input, output, and standard error.

Whether you run the Docker container in detached or foreground mode, you start Drill in a container by issuing the docker `run` command with some options, as described in the following table:


|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Option                   | Description                                                                                                                                                                                                                                                                                                     |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `-i`                     | Keeps STDIN open. STDIN is standard input, an input stream where data is sent to and read by a program.                                                                                                                                                                                                         |
| `-t`                     | Allocates a pseudo-tty (a shell).                                                                                                                                                                                                                                                                               |
| `--name`                 | Identifies the container. If you do not use this   option to identify a name for the container, the daemon generates a container ID for you. When you use this option to identify a container name,   you can use the name to reference the container within a Docker network in   foreground or detached mode. |
| `-p`                     | The TCP port for the Drill Web UI. If needed, you can   change this port using the `drill.exec.http.port` [start-up option]({{site.baseurl}}/docs/start-up-options/).                                                                                                                                           |
| `apache/drill:<version>` | The Docker Hub repository and tag. In the following   example, `apache/drill` is   the repository and `1.17.0`   is the tag:     `apache/drill:1.17.0`.     The tag correlates with the version of Drill. When a new version of Drill   is available, you can use the new version as the tag.                   |
| `bin/bash`               | Connects to the Drill container using a bash shell.                                                                                                                                                                                                                                                             |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

If you decide to work in the filesytem of the Docker image, for example to modify a Drill configuration file, then be aware that Drill has been installed to /opt/drill.  When reading the Drill documentation in the context of the official Docker image, you should substitute the mentioned path for any mentions of the environment variable `$DRILL_HOME`.

### Running the Drill Docker Container in Foreground Mode

Open a terminal window (Command Prompt or PowerShell, but not PowerShell ISE) and then issue the following command and options to connect to SQLLine (the Drill shell):
```sh
docker run -it --name drill \
	-p 8047:8047 \		# web and REST
	-p 31010:31010 \	# JDBC
	apache/drill
```

When you issue the docker run command, the Drill process starts in a container. SQLLine prints a message, and the prompt appears:

       Apache Drill 1.19.0
       "json ain't no thang"
       apache drill>

At the prompt, you can enter the following simple query to verify that Drill is running:
```sql
SELECT version FROM sys.version;
```

### Running the Drill Docker Container in Detached Mode

Open a terminal window (Command Prompt or PowerShell, but not PowerShell ISE) and then issue the following commands and options to connect to SQLLine (the Drill shell):

**Note:** When you run the Drill Docker container in detached mode, you connect to SQLLine (the Drill shell) using drill-localhost.
```sh
$ docker run --name drill \
	-p 8047:8047 \		# web and REST
	-p 31010:31010 \	# JDBC
	--detach
	apache/drill
	
<displays container ID>

$ docker exec -it drill /bin/bash

<connects to container>

$ $DRILL_HOME/bin/drill-embedded
```

After you issue the commands, the Drill process starts in a container. SQLLine prints a message, and the prompt appears:

       Apache Drill 1.19.0
       "json ain't no thang"
       apache drill>

At the prompt, you can enter the following simple query to verify that Drill is running:
```sql
SELECT version FROM sys.version;
```

## Querying Data

By default, you can only query files that are accessible within the container. For example, you can query the sample data packaged with Drill, as shown:

```sql
SELECT first_name, last_name FROM cp.`employee.json` LIMIT 1;
```
```
|------------|-----------|
| first_name | last_name |
|------------|-----------|
| Sheri      | Nowmer    |
|------------|-----------|
1 row selected (0.256 seconds)
```

To query files stored outside of the container, you can [bind mount a directory in from the host](https://docs.docker.com/storage/bind-mounts/)
```sh
docker run -it --name drill \
	-p 8047:8047 \		# web and REST
	-p 31010:31010 \	# JDBC
	-v /mnt/big/data:/mnt \
	apache/drill
```
or you can [create and mount a Docker volume](https://docs.docker.com/storage/volumes/).
```sh
docker volume create big-data-vol

docker run -it --name drill \
	-p 8047:8047 \		# web and REST
	-p 31010:31010 \	# JDBC
	-v big-data-vol:/mnt
    apache/drill
```

See the linked Docker documentation for more details.

## The /data volume

The Drill Dockerfile includes a declaration of
```
VOLUME /data
```
where /data inside the container has been chowned to the Drill process user.  This means that Drill will have read and write access to whatever volume you mount here making it a suitable place for persistent, mutable storage.  For example, by adding
```
   	sys.store.provider.local.path="/data"
```
to drill-override.conf and mounting a Docker volume at that location at container launch time you can have embedded Drill's "local persistent storage", which keeps system option values and storage configurations, presist across container launches.

## Drill Web UI

You can access the Drill web UI at `http://localhost:8047` when the Drill Docker container is running.  On Windows, you may need to specify the IP address of your system instead of using "localhost".

