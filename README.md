# @vishnuchd/nativescript-woocommerce-api
A wrapper that connects Nativescript to the WooCommerce API
## Installation
```javascript
ns plugin add @vishnuchd/nativescript-woocommerce-api
```

## Usage

// TODO

## License

Apache License Version 2.0


## Setup

You will need a consumer key and consumer secret to call your store's WooCommerce API. You can find instructions [here](https://docs.woocommerce.com/document/woocommerce-rest-api/)

Include the 'NativescriptWoocommerceApi' module within your script and instantiate it with a config:

```javascript
import { NativescriptWoocommerceApi} from '@vishnuchd/nativescript-woocommerce-api';

const WooCommerceAPI = {
  url: 'https://yourstore.com', // Your store URL
  ssl: true,
  consumerKey: 'ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Your consumer secret
  consumerSecret: 'cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Your consumer secret
  wpAPI: true, // Enable the WP REST API integration
  version: 'wc/v3', // WooCommerce WP REST API version
  queryStringAuth: true
};
```

**Instantiating a WooCommerceAPI instance without a url, consumerKey or secret will result in an error being thrown**

## Calling the API

Your WooCommerce API can be called once the WooCommerceAPI object has been instantiated (see above).

### GET

```javascript
let WooCommerceAPI = new NativescriptWoocommerceApi(options)
WooCommerceAPI.invokeGet('products')
          .then(data => {
          	console.log(data);
          })
          .catch(error => {
          	console.log(error);
          });
```

### GET WITH PARAMETER

```javascript
WooCommerceAPI.invokeGet('orders', { customer: userID, per_page: 100 })
          .then(data => {
          	console.log(data);
          })
          .catch(error => {
          	console.log(error);
          });
```

### POST

For this example you have a [Order object](http://woocommerce.github.io/woocommerce-rest-api-docs/#create-an-order).

```javascript
WooCommerceAPI.invokePost('products', {
  product: {
    title: 'Premium Quality',
    type: 'simple',
    regular_price: '21.99'
    }
  })
  .then(data => {
          	console.log(data);
          })
  .catch(error => {
          	console.log(error);
          });
```

### PUT

```javascript
WooCommerceAPI.invokePut('orders/123', {
  order: {
    status: 'completed'
  }
  })
  .then(data => {
          	console.log(data);
          })
  .catch(error => {
          	console.log(error);
          });
```

### DELETE

```javascript
WooCommerceAPI.invokeDelete('coupons/123')
.then(data => {
          	console.log(data);
          })
  .catch(error => {
          	console.log(error);
          });
});
```


