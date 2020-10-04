# SMSGlobal node SDK


![Build](https://github.com/smsglobal/smsglobal-node/workflows/Build/badge.svg?branch=master)
[![codecov](https://codecov.io/gh/smsglobal/smsglobal-node/branch/master/graph/badge.svg)](https://codecov.io/gh/smsglobal/smsglobal-node)
[![Sourcegraph](https://sourcegraph.com/github.com/smsglobal/smsglobal-node/-/badge.svg)](https://sourcegraph.com/github.com/smsglobal/smsglobal-node?badge)


The SMSGlobal Node library provides convenient access to the SMSGlobal REST API from node applications.

Sign up for a [free SMSGlobal account](https://www.smsglobal.com/mxt-sign-up/?utm_source=dev&utm_medium=github&utm_campaign=node_sdk) today and get your API Key from our advanced SMS platform, MXT. Plus, enjoy unlimited free developer sandbox testing to try out your API in full!


## Example
 Check out the [code examples](examples)


## SMSGlobal rest API credentials

Rest API credentials can be provided in the SMSGlobal client or node environment variables. The credential variables are `SMSGLOBAL_API_KEY` and `SMSGLOBAL_API_SECRET`


## Installation

```
npm install --save https://github.com/smsglobal/smsglobal-node
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
* [sms](https://www.smsglobal.com/rest-api/?utm_source=dev&utm_medium=github&utm_campaign=node_sdk#api-endpoints)
* [sms-incoming](https://www.smsglobal.com/rest-api/?utm_source=dev&utm_medium=github&utm_campaign=node_sdk#api-endpoints)

# Reference
[REST API Documentation](https://www.smsglobal.com/rest-api/?utm_source=dev&utm_medium=github&utm_campaign=node_sdk)

For any query [contact us](https://www.smsglobal.com/contact/?utm_source=dev&utm_medium=github&utm_campaign=node_sdk)
