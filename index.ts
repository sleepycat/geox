import 'isomorphic-fetch'
import gql from 'graphql-tag'
import graphql from 'graphql-anywhere'
import { GoogleResults } from './providers/google'

// Define a resolver that just returns a property
const defaultResolver = (fieldName: any, root: any) => {
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
async function parseJSON(response: Response): Promise<GoogleResults> {
  if (response.status !== 200) { throw new Error(response.statusText) }
  const json: GoogleResults = await response.json()
  return json
}

function parseGraphQL(resolver: any, query: any, json: GoogleResults) {
  if (!json.results.length) { throw new Error('No results found') }
  return graphql(resolver, query, json)
}

export function geocode (address: string, query = defaultQuery): Promise<GoogleResults> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${ encodeURI(address) }&sensor=false`
  return fetch(url)
    .then(parseJSON)
    .then(json => parseGraphQL(defaultResolver, query, json))
}
