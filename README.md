## What's this?

ClientManager is a sample CRUD application build with Backbone, RequireJS (2.0) and Twitter Bootstrap on the frontend. The backend part of the application uses Express.js and Mongoose (amongst other libraries).

<img src="https://github.com/alessioalex/ClientManager/raw/master/files/add_client.png" border="0" />
<img src="https://github.com/alessioalex/ClientManager/raw/master/files/client_list.png" border="0" />

## Quick start

- Make sure Node.js and NPM should be installed (I prefer to do it using NVM). This project was developed on Node 0.6.x.
- Install project dependencies with NPM by running the following command in the terminal (project root): 

    npm install .

- Configure the ports for the application (for multiple environments: dev, test, production) and also the settings for the MongoDB connection (you can either host MongoDB locally or try a free hosting provider such as MongoLab). The config data is in /config
- Start the server:

  a) Production

    npm start 

  b) Development (note that if you want to load all the files uncompressed you should visit http://&lt;server&gt;:&lt;port&gt;/dev.html):

    node app.js


## App structure

The application has a structure similar to Rails:

- the model and controller folders are within '/app'
- the configuration stored into json files in '/config'.
- public directory for the server: '/public'
- logs are kept into their own '/logs' folder, having one file per environment
- '/lib' is where application specific files reside
- all backend test files are inside '/test', structured into: unit tests ('/unit'), functional tests ('/functional') and the fixtures
- the Jakefile: similar to make or rake, can run tasks

Frontend:

- the '/js' folder is where the 'magic' happens: '/main.js' is the starting point (stores RequireJS configuration), which calls '/app' (that deals with the initialization for the application), the rest of the foldes are self-explanatory
- '/css' and '/img' stores the static stylesheets and images needed
- '/test' has the logic for the test runner (with Mocha), and specs

## Dev gotchas with Jake (in the terminal)

Empty the database:

    jake db:empty

Populate database with data:
    
    jake db:populate[20]

That will empty db and insert 20 new records).

Compress & concatenate assets (one file for JS & one file for CSS):

    jake app:assets

## Testing

I've chosen Mocha for all tests in this project. To run test suite in the command line use the following command in the application root (make sure things are setup properly -> the app can connect to MongoDB, can bind to the specified port):

    npm test

If you're testing on Windows, run the following commands in the terminal: 

    npm install mocha@1.1.0 -g
    mocha --ui bdd --recursive --reporter spec --timeout 10000 --slow 300

The first command installs mocha globally and the second one runs the test suite.

For client side tests, open the browser 

    http://<server>:<port>/test

## Small JS styleguide for the project

- 2 spaces for indentation
- Semicolons should be used
- Line length should be 80 (that's a soft limit, 82-83 for example is ok provided these are just a few exceptions)
- Braces go on the same line as the statement
- Vars should always be declared at the top
- Variables and properties should use lower camel case capitalization

## Browser compatibility

I haven't had time to properly test the app, but it *should* work fine in modern browsers.

## TODO / Improvements:

Client-side:

- Add popups after deleting / saving client
- More tests

Server-side:

- Bug in IE => should send Dates using miliseconds instead of the toString() stuff
- Split contents of utils.js into multiple files (more specific categories)
- Implement content-negotiation (return 406 Not Acceptable where needed)
[this is present by default in Express 3.x, upgrade when it is stable enough]
- Implement authentication and check authorization when modifying resources (OAuth maybe?)
- Implement ETags properly for the /clients and /clients/:id GET routes

## Useful links that helped me while developing this app

- http://backbonetutorials.com
- http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html
- https://github.com/jrburke/requirejs/wiki/Upgrading-to-RequireJS-2.0
- http://addyosmani.github.com/backbone-fundamentals/
- http://addyosmani.github.com/backbone-aura/
- http://coenraets.org/directory/

## License

(The MIT License)

Copyright (c) 2012 Alexandru Vladutu <alexandru.vladutu@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
