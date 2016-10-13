/* global geocode geocodeExact fetch */
/* exported geocode geocodeExact */

import gql from 'graphql-tag'
import graphql from 'graphql-anywhere'

// Define a resolver that just returns a property
const resolver = (fieldName, root) => {
  return root[fieldName]
}

const defaultQuery = gql`
{
  results {
     formatted_address
     geometry {
       location {
         lat
         lng
       }
     }
   }
 }
`

export async function geocodeExact (address, query = defaultQuery) {
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(address)}&sensor=false`
  let response, json

  let promise = new Promise(async function (resolve, reject) {
    try {
      response = await fetch(url)
    } catch (error) {
      reject(Error(`Couldn't connect to Geocoding API.`))
    }

    try {
      json = await response.json()
    } catch (error) {
      reject(Error(`Failed to get json.`))
    }

    let preciseResults = json.results.filter((result) => {
      if (result.geometry.location_type !== 'APPROXIMATE') {
        return result
      }
    })

    if (preciseResults.length > 0) {
      try {
        resolve(graphql(resolver, query, {results: preciseResults}))
      } catch (error) {
        reject(Error(error))
      }
    } else {
      reject(Error(`All results were approximate`))
    }
  })
  return promise
}

export async function geocode (address, query = defaultQuery) {
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(address)}&sensor=false`

  try {
    let response = await fetch(url)

    let json = await response.json()
    return graphql(
      resolver,
      query,
      json
    )
  } catch (error) {
  }
}

let geox = { geocode, geocodeExact }
export default geox
