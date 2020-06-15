---
layout: post
title: A quick look at Docker Compose and building a GOCD Pipeline
author: Paul Ryan
summary: summary
date: 2020-06-15
---

**Introduction**

Last time out I showed you how to build a simple Docker image of a GOCD server and launch it.  This time we will look at how [Docker Compose](https://docs.docker.com/compose/) can be used to improve your development workflow.

**Using Compose**

The main use cases for Docker Compose are;

* configuring and building different environments for development, production, staging, QA etc.
* running automated testing suites
* single host deployments

We will look at using Compose to do a simple deployment of our GOCD server, run it as a Daemon and use compose to start, close and inspect our server.

There are three steps;

1. Define the application in a **Dockerfile**.
2. Define the services that make up your application in a **docker-compose.yml** file so that they can be run together in an isolated environment.
3. Run your application using `docker-compose up`

We will use the same **Dockerfile** we used in the last blog post, this looks like

```
FROM gocd/gocd-server:latest
```

For our compose file, we will create a single service application, our **docker-compose.yml** will look like

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

Let's take a look at this in a bit more detail. 

First, we define a single service called **gocdserver** with a build location of `.` which means that compose will look for a Dockerfile in the current working directory.  

We use an **image** property of `mygocdimage`, which is the equivalent of the tag or `-t` switch we used last time to tag our image when we ran `docker build . -t mygocdimage` to build our docker image. 

Lastly we specify the ports that our application will listen on. 

Note that the compose file uses a convention of HOST PORT:CONTAINER PORT, using a host port means that requests on the host computer port will be passed to the container port on our service container (and by implication be accessible from any device that is on the same network as the host) in our example, the host and container ports are the same, but they may not be (for example if using a load balancer or a caching server)

Now all we need to do is run our server using `docker-compose up -d` you should see something like this;

```
❯ docker-compose up -d  
Creating network "gocd_default" with the default driver
Building gocdserver
Step 1/1 : FROM gocd/gocd-server:v20.4.0
 ---> 557ebecbe42e
Successfully built 557ebecbe42e
Successfully tagged mygocdimage:latest
WARNING: Image for service gocdserver was built because it did not already exist. To rebuild this image you must use `docker-compose build` or `docker-compose up --build`.
Creating gocd_gocdserver_1 ... done
```

Wait a few seconds and type `docker-compose ps` and you should see something like

```
❯ docker-compose ps
      Name                 Command          State                       Ports                     
--------------------------------------------------------------------------------------------------
gocd_gocdserver_1   /docker-entrypoint.sh   Up      0.0.0.0:8153->8153/tcp, 0.0.0.0:8154->8154/tcp
```

Your server should be accessible from http://localhost:8153.

To close the server, run `docker-compose down`

**Next Time**

Next time we will look at adding a GOCD agent to our composer service configuration and accessing the server from the outside world using [ngrok](https://ngrok.com/).