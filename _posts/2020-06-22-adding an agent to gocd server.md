---
layout: post
title: Adding an Agent to a GOCD Server
author: Paul Ryan
summary: Add a GOCD Agent to an existing Go Server Configuration
date: 2020-06-22
---

**Introduction**

In GoCD, the server controls everything but does not perform any user specified work on it its own, for this you need a GoCD agent.  You can find out more about agents [here](https://www.gocd.org/getting-started/part-1/)

In this post we will look at adding a GoCD agent to the Docker service configuration that we built [last time](/2020/06/15/using-docker-compose-new-post.html)

**Adding an Agent to our Service**

Our existing **docker-compose.yml** looks like this

```
version: '2.0'
services:
  gocdserver:
    build: .
    image: mygocdimage
    ports:
    - "8153:8153"
    - "8154:8154"
```

The first thing we need to do is separate our server and agent Docker build files. Create a folder called `server` and move the file `Dockerfile` to that folder.

Modify the build property in your config file so that it looks like this

```
    build: ./server
    image: mygocdserverimage
```

Next we need to add a new folder called `agent` and add a new `Dockerfile` to that folder.  We now need to add a basic Agent configuration to that Dockerfile.  Add the following to your `agent\Dockerfile` file;

```
FROM gocd/gocd-agent-ubuntu-18.04:v20.4.0
ENV GO_SERVER_URL=http://gocdserver:8153/go
```

The `FROM` property specifies the location of the Docker image we want to use on the Docker image repository. The `ENV` command will add an environment variable to our resultant Docker container when we build it and specifies where the GoCD agent will find the required GoCD server.

We now need to amend our Docker Compose file to include the Agent configuration. Under `services` add the following;

```
  gocdagent:
    build: ./agent
    image: mygocdagentimage
```

Your Docker Compose file should now look like the following;

```
version: '2.0'
services:
  gocdserver:
    build: ./server
    image: mygocdserverimage
    ports:
    - "8153:8153"
    - "8154:8154"
  gocdagent:
    build: ./agent
    image: mygocdagentimage
```

From a terminal or command line run `docker-compose up --build -d`

You should see something like the following;

```
❯ docker-compose up --build -d
Creating network "gocd_default" with the default driver
Building gocdserver
Step 1/1 : FROM gocd/gocd-server:v20.4.0
 ---> 557ebecbe42e
Successfully built 557ebecbe42e
Successfully tagged mygocdserverimage:latest
Building gocdagent
Step 1/3 : FROM gocd/gocd-agent-ubuntu-18.04:v20.4.0
 ---> d2132955e884
Step 2/3 : ENV GO_SERVER_URL=http://gocdserver:8153/go
 ---> Using cache
 ---> 7fb682b41d77
Step 3/3 : ENV AGENT_AUTO_REGISTER_KEY=6271e446-878b-4bb7-9cce-3584dd7b9852
 ---> Using cache
 ---> aa4296d97790
Successfully built aa4296d97790
Successfully tagged mygocdagentimage:latest
Creating gocd_gocdserver_1 ... done
Creating gocd_gocdagent_1  ... done
```

Wait a few minutes for the services to instantiate and for the agent to connect with the server and run `docker-compose ps`.  This should show that you now have a server and an agent running;

```
❯ docker-compose ps
      Name                 Command          State                       Ports                     
--------------------------------------------------------------------------------------------------
gocd_gocdagent_1    /docker-entrypoint.sh   Up                                                    
gocd_gocdserver_1   /docker-entrypoint.sh   Up      0.0.0.0:8153->8153/tcp, 0.0.0.0:8154->8154/tcp
```

Open the Agent config page http://localhost:8153/go/agents in your browser you should see something like

![this screenshot](/images/gocdserver002.png)

If you see an agent like in the screenshot, you have successfully completed this exercise.  

To close the server, run `docker-compose down`

**Next Time**

Next time we will look at building our first [pipeline](https://docs.gocd.org/current/introduction/concepts_in_go.html#pipeline) and configuring our agent to execute the jobs and tasks that we define in our pipeline.