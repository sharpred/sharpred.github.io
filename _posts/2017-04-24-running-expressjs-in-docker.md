---
layout: post
title: "Running express.js in a Docker container"
date: 2017-04-24
---
# Introduction

This article will take you through the process of creating and running an Express.js web application in a Docker container on a Mac.

## Steps

We will run through the following steps;

1. run Docker on your local system

1. create a simple express.js app and run locally on mac host

1. dockerize your express.js app and run locally inside your docker container

1. add some docker orchestration

1. what next?

## Run Docker on Your Local System

### Check your setup

run the following to confirm what versions of software you are running;

`docker —version`

you should see something like `1.12.5, build 7392c3b`

`docker-compose —version`

you should see something like `1.11.2, build dfed245`

`docker-machine —version`

you should see something like `0.8.2, build e18a919`

See <https://docs.docker.com/docker-for-mac/> for details on how to set up your mac for Docker if you have problems with any of the above commands.

### Start up Docker

Run the following commands;

`docker-machine restart`

`docker-machine env`

`eval $(docker-machine env default)`

If all of these work ok you should be able to run `docker-images` to see a list of installed images and `docker ps` to see a list of running containers (will probably be empty)

### Create a Simple Express.js Application

The simplest way to create an express.js app is to use the express application generator.  Run `npm install express-generator -g` and then run `express --view=hbs MyDockerExpressApp` you will then be prompted to install dependencies `cd MyDockerExpressApp && npm install` and to run the app `DEBUG=mydockerexpressapp:* npm start`

Go to localhost:3000 in your browser of choice.  You should see ![standard Express.js landing page](/images/expresswithdocker.png)

### Dockerize Your Express.js App and Run Locally Inside Your Docker Container

Assuming you were able to successfully run the sample app locally we can now look to “dockerize” it.

These instructions can be found in full at <https://nodejs.org/en/docs/guides/nodejs-docker-webapp/>

Create a file in the root of the project called Dockerfile
paste the following into your file

```docker
#the latest LTS (long term support) version boron of node available from the Docker Hub
FROM node:boron
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install
# Bundle app source
COPY . /usr/src/app
# a default express.js app binds to port 3000. Modify this if you change it
EXPOSE 3000
# define the startup command
CMD [ "npm", "start" ]
```

Create a file .dockerignore file in the same directory and add the following content;

```bash
node_modules
npm-debug.log
```

From the project root we are now ready to build our image.  The -t flag lets you tag the image so that it is easier to find with the docker images command `docker build -t <your username>/node-web-app`

run `docker images` to see your new image (you will also see the node boron image you specified in your Dockerfile)

run the image `docker run -p 49160:3000 -d <your username>/node-web-app`

This should return a container id.

You can also see the container id by running `docker ps` and view logs by typing
`docker logs cid` where cid is your container id

You can also enter the container by running `docker exec -it <container id> /bin/bash`

check the container IP address by typing `docker-machine ip default` this will return the IP address being used (in my case it is 192.168.99.100)

test your site is running.  Either visit 192.168.99.100:49160 in a browser or use `curl -i 192.168.99.100:49160`

### Add Some Docker Composition

first kill of your running container using `docker kill pid`

create a file called docker-compose.yml and paste in the following

```docker
version: '2'
services:
  web:
    build: .
    ports:
     - "3000:3000"
    volumes:
     - .:/usr/src/app/
```

start the composed docker file as a daemon `docker-compose -f docker-compose.yml up --build -d`

check that the container is running using `docker-compose ps`

stop the container using `docker-compose down`

### Add some redis

A basic intro on using redis with node.js can be found at
<https://www.sitepoint.com/using-redis-node-js/>

modify your docker-compose file to look like

```docker
version: '2'
services:
  redis:
    image: "redis"
    volumes:
      - /data/redis:/data
    ports:
      - "6379:6379"
  node:
    build: .
    ports:
     - "3000:3000"
    volumes:
     - .:/usr/src/app/
    links:
     - redis
```

More on Docker-Compose at
<https://docs.docker.com/compose/gettingstarted/#step-3-define-services-in-a-compose-file>

add some redis code to your app.js file.  After the line `var app = express()` add

```
var redis = require('redis');
//note the hostname redis must agree with the name of the service in your docker-compose.yml file
var client = redis.createClient(6379, "redis"); //creates a new client
client.on('connect', function() {
    console.log('redis connected');
});
client.set('message', 'I \u2665 Docker', function(err, reply) {
  console.log(`redis update ${reply}`);
});
client.get('message',function(err, reply) {
  console.log(`read from redis ${JSON.stringify(reply)}`);
});
```

run `docker-compose restart` and then run `docker-compose logs` and you should see the initialisation of redis followed by the read/write being logged to the console

### What Next?

automatic updating and remote debugging are obvious candidates for building on this. I will expand on these topics in future blogs.
