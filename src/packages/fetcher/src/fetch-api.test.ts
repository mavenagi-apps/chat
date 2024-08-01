import {HttpResponse, http} from 'msw'
import {setupServer} from 'msw/node'
import {afterAll, afterEach, beforeAll, describe, expect, test} from 'vitest'

import {Fetcher} from './fetch-api'

export const fetcher = new Fetcher({
  baseUrl: `${window.location.origin}/api/v1` as const,
  config: {
    headers: {
      'x-test': 'test',
    },
  },
})

const server = setupServer()

beforeAll(() => server.listen({onUnhandledRequest: 'error'}))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('fetch api', () => {
  test('request', async () => {
    server.use(
      http.post('/api/v1/post_json', async req => {
        expect(req.request.headers.get('Content-Type')).toBe('application/json')
        expect(req.request.headers.get('x-test')).toBe('test')
        expect(Object.fromEntries(new URL(req.request.url).searchParams.entries())).toEqual({param1: 'param1value'})
        expect(await req.request.json()).toEqual({reqbody1: 'reqbodyvalue', reqbody2: [1, 2, 3]})
        return HttpResponse.json({resbody1: 'resbodyvalue', resbody2: [4, 5, 6]})
      })
    )
    let resp = await fetcher.request({
      method: 'POST',
      url: 'post_json',
      data: {reqbody1: 'reqbodyvalue', reqbody2: [1, 2, 3]},
      params: {param1: 'param1value', nullparam: null, undefinedparam: undefined},
    })
    expect(resp.ok).toBe(true)
    expect(resp.status).toBe(200)
    expect(await resp.json()).toEqual({resbody1: 'resbodyvalue', resbody2: [4, 5, 6]})
    expect(
      await fetcher.post(
        'post_json',
        {reqbody1: 'reqbodyvalue', reqbody2: [1, 2, 3]},
        {params: {param1: 'param1value'}}
      )
    ).toMatchObject(resp)

    server.use(http.get('/get_error', _ => HttpResponse.text('error', {status: 500})))
    await expect(
      async () =>
        await fetcher.request({
          method: 'GET',
          url: '/get_error',
        })
    ).rejects.toThrow('500 Internal Server Error: error')
    await expect(async () => await fetcher.get('/get_error')).rejects.toThrow('500 Internal Server Error: error')

    server.use(http.put('/put', _ => HttpResponse.text('put response', {status: 200})))
    resp = await fetcher.request({method: 'PUT', url: '/put'})
    expect(resp.ok).toBe(true)
    expect(await fetcher.put('/put')).toMatchObject(resp)

    server.use(http.delete('/delete', _ => HttpResponse.text('delete response', {status: 200})))
    resp = await fetcher.request({method: 'DELETE', url: '/delete'})
    expect(resp.ok).toBe(true)
    expect(await fetcher.delete('/delete')).toMatchObject(resp)

    server.use(
      http.post('/post_form', async req => {
        expect(req.request.headers.get('Content-Type')).toMatch(/^multipart\/form-data/)
        const formData = new FormData()
        formData.append('reqbody1', 'reqbodyvalue')
        formData.append('reqbody2', '1')
        formData.append('reqbody2', '2')
        formData.append('reqbody2', '3')
        expect(Array.from((await req.request.formData()).entries())).toEqual(Array.from(formData.entries()))
        return HttpResponse.text('response', {status: 200})
      })
    )
    resp = await fetcher.postForm('/post_form', {reqbody1: 'reqbodyvalue', reqbody2: ['1', '2', '3']})

    server.use(
      http.put('/put_form', async req => {
        expect(req.request.headers.get('Content-Type')).toMatch(/^multipart\/form-data/)
        return HttpResponse.text('response', {status: 200})
      })
    )
    resp = await fetcher.putForm('/put_form', {})
  })
})
