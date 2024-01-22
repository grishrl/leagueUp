# NGS - MEAN Core

MEAN Stack application for managing the Heroes of the Storm NGS League

## Getting Started

Clone the repo to your local machine, 

Run npm install in the top level directroy - this install any dependecies for the server
Run npm install in the client directory - this install any dependencies for the client

Install the heroku local CLI https://devcenter.heroku.com/articles/heroku-cli#download-and-install

Request a copy of the .env file for the node server

Create a file in the top level directory "Procfile"
Inside the proc file paste the following: web: npm start

at the top directory level of the project from CLI; run heroku local:start web

inside the client directory run npx ng build --watch --configuration=local

Connect to localhost:5000


### !!! If you want to run the webClient Only - DO NO REQUIRE LOCAL NODE RUNNING !!!

### Prerequisites

* NPM,
* Clone the repo to your local machine 

Run `npm install` in the client directory - this install any dependencies for the client
inside the client directory run `npx ng serve --configuration=local-prod-no-server` for running client locally against prod server
inside the client directory run `npx ng serve --configuration=local-dev-no-server` for running client locally against dev server


### !!! RUNNING LOCAL NODE
### Prerequisites

* Heroku Local CLI
* NPM,
* Clone the repo to your local machine 


### Running locally
Run `npm install` in the top level directroy - this install any dependecies for the server  
Run `npm install` in the client directory - this install any dependencies for the client  

Run npm install in the server directroy
Run npm install in the client directory

Install the heroku local CLI

Request a copy of the .env file for the node server

Create a file in the top level directory "Procfile"
Inside the proc file paste the following: web: npm start

at the top directory level of the project from CLI; run `heroku local:start web`

inside the client directory run `npx ng build --watch --configuration=local`

Connect to http://localhost:3000 check the ports to know for sure!
