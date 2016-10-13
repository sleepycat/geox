import 'isomorphic-fetch'
import 'mocha'
import * as fetchMock from 'fetch-mock'
import gql from 'graphql-tag'
import * as assert from 'assert'
import { geocode, geocodeExact } from './index'
import { GoogleResults } from './providers/google'

const approximateResponse: GoogleResults = require('./data/google_approximate_response')
const exactResponse: GoogleResults = require('./data/google_exact_response')

describe('Geox', () => {
  describe('with approximate results', () => {
    // Why do I have to stringify that?
    beforeEach(() => fetchMock.mock('^https://maps.googleapis.com', JSON.stringify(approximateResponse)))
    afterEach(() => fetchMock.restore())
    describe('#geocode', () => {
      it('returns formatted_address, lat & lng by default', async () => {
        let { results } = await geocode('ottawa, canada')
        assert.equal('Ottawa, ON, Canada', results[0].formatted_address)
        assert.equal(45.4215296, results[0].geometry.location.lat)
        assert.equal(-75.69719309999999, results[0].geometry.location.lng)
      })

      it('filters the results according to a graphql query', async () => {
        const query = gql`{ results { addr:formatted_address } }`
        let { results } = await geocode('ottawa, canada', query)
        assert.equal('Ottawa, ON, Canada', results[0].addr)
        assert.equal(undefined, results[0].geometry)
      })
    })
    describe('#geocodeExact', () => {
      it('throws an error', async () => {
        const query = gql` { results { addr:formatted_address } } `
        try {
          await geocodeExact('ottawa, canada', query)
        } catch (e) {
          assert.equal('All results were approximate', e.message)
        }
      })
    })
  })

  describe('with exact results', () => {
    beforeEach(() => fetchMock.mock('^https://maps.googleapis.com', JSON.stringify(exactResponse)))
    afterEach(() => fetchMock.restore())
    describe('#geocode', () => {
      it('geocodes as normal', async () => {
        const query = gql`{ results { addr:formatted_address } }`
        let { results } = await geocode('ottawa, canada', query)
        assert.equal('200 Kent St, Ottawa, ON K1R, Canada', results[0].addr)
      })
    })

    describe('#geocodeExact', () => {
      it('geocodes addresses successfully', async () => {
        const query = gql` { results { addr:formatted_address } } `
        const results: any = await geocodeExact('200 Kent St, Ottawa', query)
        assert.equal('200 Kent St, Ottawa, ON K1R, Canada', results[0].addr)
      })
      it('geocodes without the query parameter', async () => {
        let { results } = await geocodeExact('200 Kent St, Ottawa')
        assert.equal('200 Kent St, Ottawa, ON K1R, Canada', results[0].formatted_address)
      })
    })
  })
})
