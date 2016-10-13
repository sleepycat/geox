import test from 'ava'
import gql from 'graphql-tag'
import * as geox from './index'

test('geocode', async t => {
  const g = await geox.geocode('Ottawa, Canada')
  t.deepEqual('Ottawa, ON, Canada', g.results[0].formatted_address)
  t.deepEqual(45.4215296, g.results[0].geometry.location.lat)
  t.deepEqual(-75.69719309999999, g.results[0].geometry.location.lng)
})

test('geocode graphql', async t => {
  const query = gql`{ results { addr:formatted_address } }`
  const g: any = await geox.geocode('Ottawa, Canada', query)
  t.deepEqual('Ottawa, ON, Canada', g.results[0].addr)
})
