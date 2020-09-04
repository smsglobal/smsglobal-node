# SMSGlobal node SDK


![Build](https://github.com/smsglobal/smsglobal-node/workflows/Build/badge.svg?branch=master)
[![Sourcegraph](https://sourcegraph.com/github.com/smsglobal/smsglobal-node/-/badge.svg)](https://sourcegraph.com/github.com/smsglobal/smsglobal-node?badge)
[![Downloads](https://img.shields.io/npm/dm/smsglobal.svg)](https://www.npmjs.com/package/smsglobal)
![Node](https://img.shields.io/node/v/smsglobal)
![npm](https://img.shields.io/npm/v/smsglobal)


The SMSglobal Node library provides convenient access to the SMSglobal rest API from node applications.


## Example
 Check out the [code examples](examples)


## SMSglobal rest API credentials

Rest API credentials can be provided in the SMSGlobal client or node environment variables. The credential variables are `SMSGLOBAL_API_KEY` and `SMSGLOBAL_API_SECRET`



## Installation

```
npm install --save smsglobal
```


## Usage

* Require `smsglobal` in your file


```
const apiKey = 'YOUR_API_KEY';
const apiSecret = 'YOUR_API_SECRET';
var smsglobal = require('smsglobal')(apiKey, secret);
```

### To send a sms
```

var payload = {
    origin: 'from number',
    destination: 'destination',
    message: 'This is a test message'
}

smsglobal.sms.send(payload, function (error, response) {
    console.log(response);
});



```
### To fetch a list outgoing sms

```
var promise = smsglobal.sms.getAll();

promise
    .then(function(response) {
        console.log(response)
    })
    .catch(function(error){
        console.log(error)
    });
```

### To fetch an outgoing sms by id

```
var id = 'outgoing-sms-id';
var promise = smsglobal.sms.get(id);

promise
    .then(function(response) {
        console.log(response)
    })
    .catch(function(error){
        console.log(error)
    });
```

### To fetch a list incoming sms

```
var promise = smsglobal.sms.incoming.getAll();

promise
    .then(function(response) {
        console.log(response)
    })
    .catch(function(error){
        console.log(error)
    });
```

### To fetch an incoming sms by id

```
var id = 'incoming-sms-id';
var promise = smsglobal.sms.incoming.get(id);

promise
    .then(function(response) {
        console.log(response)
    })
    .catch(function(error){
        console.log(error)
    });
```
> All method returns promise if no callback is given

## Running tests

Run the tests:

```
npm test
```


To run test with code coverage report

```
npm run mocha-only
```


## Following endpoints are covered
* sms
* sms-incoming

# Reference
[Rest api documentation](https://www.smsglobal.com/rest-api/)