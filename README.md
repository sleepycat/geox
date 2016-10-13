# geox

This is a little wrapper around the Google geocoding API. It assumes a global `fetch` function exists.

```sh
npm install --save geox
yarn add geox
```

Basic usage is exactly what you might expect.

```javascript
> require('isomorphic-fetch')
> geox = require('geox').default
> geox.geocode("200 Kent St, Ottawa").then((data) => console.log(JSON.stringify(data)))
Promise { <pending> }
> {"results":[{"formatted_address":"200 Kent St, Ottawa, ON K1R, Canada","geometry":{"location":{"lat":45.417127,"lng":-75.7015053}}}]}
```



### Why?

This library solves two specific problems: Customized results, and dealing with vague results.

### Customized results with GraphQL

Google returns a lot of information in their [response](https://maps.googleapis.com/maps/api/geocode/json?address=200%20Kent%20St,%20Ottawa&sensor=false) and most geocoding libraries only return parts of it.
`geox` uses the [graphql-tag](https://github.com/apollostack/graphql-tag) library to filter and modify the response with a GraphQL query.
The default query returns `formatted_address` and the `lat` and `lng` values in the `geometry` section of the response. If you want some thing else, just supply your own GraphQL query.

```javascript
> require('isomorphic-fetch')
> geox = require('geox').default
> gql = require('graphql-tag')
> geox.geocode("200 Kent St, Ottawa", gql`{results { formatted_address place_id}}`).then((data) => console.log(JSON.stringify(data)))
> {"results":[{"formatted_address":"200 Kent St, Ottawa, ON K1R, Canada","place_id":"ChIJy4vDdFMEzkwRFZjfTeGZZeg"}]}
```

You can also use GraphQL's alias feature to modify the names of the results.


```javascript
> geox.geocode("200 Kent St, Ottawa", gql`{results { addr:formatted_address pid:place_id}}`).then((data) => console.log(JSON.stringify(data)))
> {"results":[{"addr":"200 Kent St, Ottawa, ON K1R, Canada","pid":"ChIJy4vDdFMEzkwRFZjfTeGZZeg"}]}
```

### Vague Results

One of the nice things about Google's API is that it will tell you if the result is something vague like "Ottawa" by returning `"location_type" : "APPROXIMATE"` in the results. If you only want non-approximate results you can use `geocodeExact`.

```javascript
> geox.geocodeExact("Ottawa", gql`{results { addr:formatted_address geom:geometry {location {lat} }}}`).then((data) => console.log(JSON.stringify(data))).catch(console.warn)
Promise { <pending> }
> Error: All results were approximate
```

### ES6 imports

It's not always super obvious how to import things via the new ES6
modules, so here is an example:

```javascript
//import fetch as a global
import 'isomorphic-fetch'
import gql from 'graphql-tag'

import geox from 'geox'
//or
import { geocode } from 'geox'
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

Feedback and improvments welcome. There is nothing here that cannot be
improved upon.



