## Solone
> A component file routing system

[![NPM version][npm-image]][npm-url]

Table of contents
=================

   * [What is it?](#what-is-it)
   * [Installation](#installation)
   * How to use it:
      * [Getting started](#getting-started)
      * [Environment](#environment)
      * [Routing](#routing)
      * [Authentication](#authentication)
   * [How to contribute](#how-to-contribute)
   * [License](#license)
   
What is it?
==========
This library allows to fetch the files for usable components in the kaleo framework using the kaleo configs and url queries to determine the files to fetch based on environments and can be used both for the frontend and the backend

Installation
============
This libray can be installed using:

 * [NPM](https://www.npmjs.com) :  `npm install solone --save`
 * [Bower](https://bower.io/) : `bower install solone --save`
 * [Yarn](https://yarnpkg.com/lang/en/docs/install) : `yarn add solone`
 
Getting started
============
The script can be loaded both in the head and in the body.

Browser
```
 <script src="/(node_modules|bower_modules)/solone/solone.min.js"></script>
```

Node
```
var solone = require('solone');
```

To use the library is determined whether you are using it for Node or for the frontend

Express (Node)
```
 var solone = require('solone');
 var express = require('express')();
 express.use(solone);
```

Connect (Node)
```
 var solone = require('solone');
 var connect = require('connect')();
 connect.use(testServer);
```
Native (Node)
```
 var solone = require('solone');
 var http = require('http');
 http.createServer(function(req, res){
    return solone(req,res,function(){});
 });
```

The browser requires an init to properly fetch required files that it uses

Browser
```
 solone.init(function(){
   solone('component')
   .then(console.log) // logs component function
   .catch(console.error) // in case the component does not exist
 })
```

Environment
============
Setting the allowable environments and the current environment help you to seperate out which component versions to fetch

Altering class config
```
solone.config().env = 'qa';
```

Using local config.js
```
module exports = {
  environments: ['qa'],
  env: 'qa'
}
```

Using the header query
```
  /component?env=qa
```

Routing
============
Routing comes in two forms, a NodeJS backend based routing and a frontend based routing.
By default frontend based routing will be on. To turn on backend routing do the following

NodeJS *express/connect
```
httpserver.use(require('solone'));
```

Frontend
```
solone.backendRouting(true);
```

You can also change the directory where your app exists by using the base and prefix settings.
this can be changed either through the library methods or in your config file. What this does is
set the beginning of the url that will be used when fetching your local config, auth, and component files.

Config
```
module.exports = {
  prefix: '/app',
  base: '/src'
}
```

Library
```
solone.base('/src')
.prefix('/app');
```

Authentication
============
Authentication allows for using authorization to allow the fetching of any component.
In this way you can block the use of some components without proper authentication.
Authentication is done in the following files

NodeJS
```
auth-server.js
```

Frontend
```
auth-client.js
```

The authentication method recieves the following:

- Param 1 Info (object) Info on the request
  - component: The name of the component
  - query: A query object containing the environment, debug and other header query info
  - headers: Any headers that were passed, for FE this can be altered in regards what to send to the server, BE this is the sent headers
- Param 2 Resolve (function) run this to dictate authorization was a success
- Param 3 Reject (function) run this to dictate the authorization was a failure

Example: (only allow prod environment)
```
function (info, resolve, reject){
  if(info.query.env === 'prod') return resolve();
  reject();
}
```

A on authorization failed event can also be added for extra functionality
```
solone.setAuthFailListener(function(component, query){
  console.error('You are not an authorized user for this component!', component);
})
```

How to contribute
=================
If You would like to contribute here are the steps

1. Clone Repo: [Peprze Github Repo](https://github.com/keleko34/solone)
2. Install any necessary dev dependencies
3. build the project `npm run build`
4. test your changes don't break anything `npm test`
5. Make a pull request on github for your changes :)

License
=======
You can view the license here: [License](https://github.com/keleko34/solone/blob/master/LICENSE)

[npm-url]: https://www.npmjs.com/package/solone
[npm-image]: https://img.shields.io/npm/v/solone.svg