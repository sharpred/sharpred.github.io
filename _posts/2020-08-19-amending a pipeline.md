---
layout: post
title: Amending a pipeline on a Go Server
author: Paul Ryan
summary: Amending a pipeline on a Go Server
date: 2020-08-19
---

**Introduction**

[Last time out](/2020/07/09/adding-a-pipeline.html) we created our first pipeline.  In this post we will look at how the Go Server handles issues with your deployment pipeline.  We will also look at how we make changes to our pipeline config.

**Before We Start**

Make sure your Go Server is running and navigate to [it](http://localhost:8153/go)

**Dealing With Errors**

First up we need to introduce an error to our pipeline project.  

Open a terminal / command prompt at the location of your Progressive Web App project. Run `npm test`, you should see something like this;

```
❯ npm test

> your-first-pwapp@2.0.0 test /Users/xxxxx/your-first-pwapp
> echo 'Error: no test specified'

Error: no test specified
```

You can also see something similar if you look at the job history of your pipeline.  This is something of a false positive error as it does not actually return an error, so the pipeline job will execute and report that it ran successfully.

Let's install a testing framework and add a failing test. We will use [Jest](https://jestjs.io/)
 as our testing framework.  Run `npm i jest --save-dev` to install it.

Amend the file `package.json` to use jest as our testing framework. Amend your scripts property to look as follows;

```
"scripts": {
    "start": "node server.js",
    "test": "jest"
  },
```

Run `npm test` again.  You should now see something like this;

```
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /Users/xxxx/your-first-pwapp
  9 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 0 matches
  testPathIgnorePatterns: /node_modules/ - 9 matches
  testRegex:  - 0 matches
Pattern:  - 0 matches
npm ERR! Test failed.  See above for more details.
```

The test has now exited with a code of 1, which means that when a Go Agent runs this task it will cause the pipeline to fail.  Commit your changes and push them to Github.

Wait a couple of minutes and your Go Server should poll Github for changes to the PWA App repo and run the pipeline jobs.  Drill down into the job history and you should see something like this;

![this screenshot](/images/gocdserver009.png)

The agent could not find the jest executable, so we need to amend our pipeline to add the installation task.

On the Go Server, click on the settings wheel next to your pipeline definition. Click on the Stages tab and then click on "add new stage"

Add a new stage called "install" and a job called "npm_install"

Ensure your custom commands look like the following screenshot;

![this screenshot](/images/gocdserver010.png)

Return to the home page of the Go Server and kick off the pwa_app pipeline manually (click the start button)

We now need to go back to the Your PWA repo and write a passing test.

Create a folder called `__tests__` and add a file called test1.js.  Add the following code;

```
it('This should pass', () => {
    expect(true).toBe(true)
})
```

Commit your changes and push them to Github. After a couple of minutes, your changes should trigger another pipeline job and this time it should run successfully.

Congratulations! you have just completed your first pipeline amendment.  Remember to back up your Go Server and create a new Docker image with the resultant backup. Refer back to [here](/2020/07/09/adding-a-pipeline.html) if you need a refresher on how to do this.

Next Time

Next time we will look at deploying our application from a Go Server pipeline.