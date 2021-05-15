//* middleware and building routes:
/* 
const express = require("express");
const morgan = require("morgan");
const app = express();

const logging = (req, res, next) => {
  console.log("A request is being made!");

  // The next parameter, when called, will tell Express that this middleware function is complete. It will then go on to the next piece of middleware.
  next();
};

const sayHello = (req, res, next) => {
  // The res parameter stands for response. This object has information and methods related to sending back a response from the server.
  res.send("Hello!");

  // without a next(); statement, when sayHello is called, no other middleware will trigger after it.
};

app.use(morgan("dev"));
// app.use(sayHello);

// visiting http://localhost:5000/hello  will respond with "Hello!"
app.get("/hello", sayHello);

module.exports = app;
 */

//* query and route parameters

const express = require("express");
const morgan = require("morgan");
const app = express();

const sayHello = (req, res) => {
  console.log(req.query);
  const name = req.query.name;
  const content = name ? `Hello, ${name}!` : "Hello!";
  res.send(content);
};

const saySomething = (req, res) => {
  const greeting = req.params.greeting;
  const name = req.query.name;

  const content = greeting && name ? `${greeting}, ${name}!` : `${greeting}!`;
  res.send(content);
};

app.get("/hello", sayHello);
app.get("/say/:greeting", saySomething);
// http://localhost:5000/say/Greetings
// -> "Greetings!"

// http://localhost:5000/say    (skipping the parameter)
// -> "Cannot GET /say"

// http://localhost:5000/say/Hola?name=Danni
// -> "Hola, Danni!"

//* Multiple Routes
//? If you make a request to /say/Hola, does Express look at your /hello route at all?
// The answer is yes. Express looks at each piece of middleware in order. If it doesn't have a route string, it runs the middleware as expected. But if it does have a route string, it will first look to see if the request URL matches up with the route string. If it does, it will run the route function; otherwise, it will skip over it.

const sayGoodbye = (req, res) => {
  res.send("Sorry to see you go!");
};

app.get("/say/goodbye", sayGoodbye);
//* Order Matters
// http://localhost:5000/say/goodbye -> "goodbye!"
// Because the /say/:greeting route matches the path /say/goodbye, you will call the saySomething() function first. That means if you went to the following URL:

//* Organizing your code / Cleaner way
// instead of const =     and then app.get() to invoke it, you can bundle together by placing the functions inside of the routes as anonymous functions, like:
/* 
app.get("/say/goodbye", (req, res) => {
  res.send("Sorry to see you go!");
});
*/

//! ------------------------------------------------------------
//* Error Handling

//* ROUTER LEVEL MIDDLEWARE
const checkForAbbreviationLength = (req, res, next) => {
  const abbreviation = req.params.abbreviation;
  if (abbreviation.length !== 2) {
    next("State abbreviation is invalid.");
  } else {
    next();
  }
};

// The two routes below  have the same guard for invalid abbreviations. Instead, you could use a piece of middleware above them, that instead of res.send() the error message, just uses next() to send the shared error response down to your handler
/*
  app.get("/states/:abbreviation", (req, res, next) => {
  const abbreviation = req.params.abbreviation;
  if (abbreviation.length !== 2) {
    next("State abbreviation is invalid.");
  } else {
    res.send(`${abbreviation} is a nice state, I'd like to visit.`);
  }
});

app.get("/travel/:abbreviation", (req, res, next) => {
  const abbreviation = req.params.abbreviation;
  if (abbreviation.length !== 2) {
    next("State abbreviation is invalid.");
  } else {
    res.send(`Enjoy your trip to ${abbreviation}!`);
  }
}); 
*/

// These are the above route refactored to use the new checkForAbbreviationLength method we installed above them.
app.get(
  "/states/:abbreviation",
  checkForAbbreviationLength,
  (req, res, next) => {
    res.send(`${req.params.abbreviation} is a nice state, I'd like to visit.`);
  }
);

app.get(
  "/travel/:abbreviation",
  checkForAbbreviationLength,
  (req, res, next) => {
    res.send(`Enjoy your trip to ${req.params.abbreviation}!`);
  }
);

/* 
? if request was:   http://localhost:5000/travel/OR
* Then process that Express will follow will look somewhat like this:
1. Express receives the request and begins to check the middleware pipeline.
2. Express takes the request through an application-level middleware (such as morgan) at the top of your file.
3. Express looks at the /states/:abbreviation route and, seeing that it does not match the request URL, skips over it.
4. Express looks at the /travel/:abbreviation route and, seeing that it does match the request URL, calls the next middleware function.
5. The next middleware function is checkForAbbreviationLength(). The function runs and determines that the abbreviation route parameter is valid, calling the next() function with no arguments.
6. The route function is now called, and the server responds with "Enjoy your trip to OR!".
*/

//* Error Handling for ROUTE NOT FOUND:
// req.path = part of url that didn't match any other routes
app.use((req, res, next) => {
  res.send(`The route ${req.path} does not exist!`);
});

//* Error Handler
// only triggered if there is a mistake in application code or specifically triggered by a previous next() function in other middleware
app.use((err, req, res, next) => {
  // console.error() sends to terminal
  console.error(err);
  res.send(err);
});

app.use(morgan("dev"));

module.exports = app;
