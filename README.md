<h3 align="center">express-starter-template</h3>

---

<p align="center"> An API template to start express on the easy way
    <br> 
</p>

## 📝 Table of Contents
- [📝 Table of Contents](#-table-of-contents)
- [🧐 About ](#-about-)
- [🏁 Getting Started ](#-getting-started-)
  - [Prerequisites](#prerequisites)
  - [Installing](#installing)
- [🔧 Running the tests ](#-running-the-tests-)
  - [About code coverage](#about-code-coverage)
  - [test comment has already defined in package.json](#test-comment-has-already-defined-in-packagejson)
- [🎈 Usage ](#-usage-)
- [🚀 Deployment ](#-deployment-)
- [⛏️ Built Using ](#️-built-using-)
- [🎉 Local Debug ](#-local-debug-)
  - [Visual studio code](#visual-studio-code)
    - [Hot reload](#hot-reload)
- [🎉 Acknowledgements ](#-acknowledgements-)

## 🧐 About <a name = "about"></a>
A template to make user to build a simple project
## 🏁 Getting Started <a name = "getting_started"></a>
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Prerequisites
What things you need to install the software and how to install them.

```
Give examples
```

### Installing
A step by step series of examples that tell you how to get a development env running.

Say what the step will be

```
Give the example
```

And repeat

```
until finished
```

End with an example of getting some data out of the system or using it for a little demo.

## 🔧 Running the tests <a name = "tests"></a>

### About code coverage
> Condition coverage (branch_coverage): On each line of code containing some boolean expressions, the condition coverage answers the following question: 'Has each boolean expression been evaluated both to true and to false?'. This is the density of possible conditions in flow control structures that have been followed during unit tests execution.
- Formula
  - Condition coverage = (CT + CF) / (2*B)
where:
  - CT = conditions that have been evaluated to 'true' at least once
  - CF = conditions that have been evaluated to 'false' at least once
  - B = total number of conditions

More detail informations please refer to the link at the end of document.

### test comment has already defined in package.json
```cmd=
npm test
```

## 🎈 Usage <a name="usage"></a>
Add notes about how to use the system.

## 🚀 Deployment <a name = "deployment"></a>
Add additional notes about how to deploy this on a live system.

## ⛏️ Built Using <a name = "built_using"></a>
- [CosmosDB](https://azure.microsoft.com/en-us/products/cosmos-db/) - Database
- [Express](https://expressjs.com/) - Server Framework
- [NodeJs v16.20.2](https://nodejs.org/en/) - Server Environment

## 🎉 Local Debug <a name = "local_debug"></a>

### Visual studio code

#### Hot reload

A good, up to date alternative to supervisor is nodemon:

Monitor for any changes in your node.js application and automatically restart the server - perfect for development

To use nodemon with version of Node without npx (v8.1 and below, not advised):

```bash=
$ npm install nodemon -g
$ nodemon app.js
```

Or to use nodemon with versions of Node with npx bundled in (v8.2+):
- it's useful to me
```bash=
$ npm install nodemon
$ npx nodemon app.js
```

Or as devDependency in with an npm script in package.json:

```script=
"scripts": {
  "start": "nodemon app.js"
},
"devDependencies": {
  "nodemon": "..."
}
```


kill task in windows CMD

```bash=
netstat -ano | findstr :<PORT>
taskkill /PID <PID> /F
```

## 🎉 Acknowledgements <a name = "acknowledgement"></a>
- Hat tip to anyone whose code was used
- Inspiration
- References
  - [SonarQube test coverage document](https://docs.sonarsource.com/sonarqube/latest/user-guide/metric-definitions/)
