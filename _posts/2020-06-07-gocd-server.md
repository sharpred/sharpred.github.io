---
layout: post
title: Building a CI/CD Server
author: Paul Ryan
summary: Getting Set Up with a CI/CD Server
date: 2020-06-07
---
**Introduction**

There are lots of different options for running a CI/CD Server, you can use what I would describe as third party "generalist" services like [Circle CI](https://circleci.com/) or [Travis CI](https://travis-ci.org/), or you can use services that specialise in a specific type of build.  In my line of work (mobile app development) the specialist services would include the likes of [BuddyBuild](https://www.buddybuild.com/) or [CodeMagic](https://codemagic.io/start/) for building iOS and Flutter applications respectively.  

I am going to start this section of my blog by talking about the CICD server that I have the most experience of, namely, [GoCD Server from ThoughtWorks Inc.](https://www.gocd.org/)

**Setting Things Up**

The easiest way to get started with GoCD is to use a Docker image.  If you do not have Docker installed I will do a post on Docker at a later date but, for now, head on over to [Docker](https://www.docker.com/) and get yourself set up if you need to.

We will start with a simple installation and then modify our Dockerfile as we progress through the steps.  A simple Dockerfile can look merely like this;

```
FROM gocd/gocd-server:latest
```

Running `docker build .` from a command line or terminal should result in something like the following appearing;

```
❯ docker build .

Sending build context to Docker daemon  2.048kB
Step 1/1 : FROM gocd/gocd-server:v20.4.0
v20.4.0: Pulling from gocd/gocd-server
cbdbe7a5bc2a: Pull complete 
6de64cb887e5: Pull complete 
c2fe25cff160: Pull complete 
d89af7f87fa5: Pull complete 
0b33aed149c0: Pull complete 
4ba2a8528dac: Pull complete 
b46c5eeb051d: Pull complete 
1358f24c95c2: Pull complete 
d75c11233860: Pull complete 
Digest: sha256:a50d5ecd48686a4b7c4d86c645ca16f4e5f3e540016939ea63aa520819a06f95
Status: Downloaded newer image for gocd/gocd-server:v20.4.0
 ---> 557ebecbe42e
Successfully built 557ebecbe42e
```

It can be useful to tag your Docker images to make it easier to use them afterwards.  Repeating the last command with the switch `-t mygocdimage` will return something like this;

```
❯ docker build . -t mygocdimage

Sending build context to Docker daemon  2.048kB
Step 1/1 : FROM gocd/gocd-server:v20.4.0
 ---> 557ebecbe42e
Successfully built 557ebecbe42e
Successfully tagged mygocdimage:latest
```

**Running the Server**

You can now run your GoCD Server by typing `docker run -d -p8153:8153 mygocdimage` wait a couple of minutes and then type `docker ps -a` to check that your container is running.  You should see something like

```
❯ docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                       PORTS                    NAMES
dee2b58cb124        mygocdimage         "/docker-entrypoint.…"   2 minutes ago       Up 2 minutes                 0.0.0.0:8153->8153/tcp   adoring_colden
```

Upon visiting the landing page http://localhost:8153 in your browser you should see something like

![this screenshot](/images/gocdserver001.png)

**Finishing Off**

To shutdown the GoCD server, Run `docker stop CONTAINERID` where CONTAINERID is the id returned from `docker ps -a` as executed previously.

**Next Time**

My next post will look at cover creating pipelines and executing pipeline jobs and we will look at Docker Compose, a tool for defining and running multi-container Docker applications.