import 'isomorphic-fetch'
import gql from 'graphql-tag'
import graphql from 'graphql-anywhere'
import { GoogleResults } from './providers/google'

// Define a resolver that just returns a property
const resolver = (fieldName: any, root: any) => {
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

export async function geocodeExact(address: string, query = defaultQuery): Promise<GoogleResults> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${ encodeURI(address) }&sensor=false`
  let response: any
  let json: GoogleResults

  let promise: Promise<GoogleResults> = new Promise(async (resolve, reject) => {
    try {
      response = await fetch(url)
    } catch (error) {
      reject(Error(`Couldn't connect to Geocoding API.`))
    }

    try {
      json = response.json()
    } catch (error) {
      return reject(Error(`Failed to get json.`))
    }

    let preciseResults = json.results.filter((result) => {
      if (result.geometry.location_type !== 'APPROXIMATE') {
        return result
      }
    })

    if (preciseResults.length > 0) {
      try {
        return resolve(graphql(resolver, query, {results: preciseResults}))
      } catch (error) {
        return reject(Error(error))
      }
    } else {
      return reject(Error(`All results were approximate`))
    }
  })
  return promise
}

export async function geocode (address: string, query = defaultQuery): Promise<GoogleResults> {
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${ encodeURI(address) }&sensor=false`
  let response = await fetch(url)
  let json: GoogleResults = await response.json()
  return graphql(
    resolver,
    query,
    json
  )
}
