import tap from 'tap'
import React from 'react'
import { renderToStaticMarkup as render } from 'react-dom/server'

import * as Lib from '../'

const { Box, Type } = Lib

tap.test('Box - base', async t => {
  const h = render(<Box>Hello</Box>)
  t.ok(/Hello/.test(h))
  t.ok(/width:100%/.test(h))
})
tap.test('Box - a', async t => {
  const h = render(<Box a='center'>Hello</Box>)
  t.ok(/align="center"/.test(h))
  t.ok(/margin:0 auto/.test(h))
  t.ok(/width:auto/.test(h))
})
tap.test('Box - c', async t => {
  const h = render(<Box c='white'>Hello</Box>)
  t.ok(/color:white/.test(h))
})
tap.test('Box - bg', async t => {
  const h = render(<Box bg='tomato'>Hello</Box>)
  t.ok(/background-color:tomato/.test(h))
})
tap.test('Box - w', async t => {
  const h = render(<Box w={200}>Hello</Box>)
  t.ok(/width:200px/.test(h))
  t.ok(/width="200"/.test(h))
  const h2 = render(<Box w='200px'>Hello</Box>)
  t.ok(/width:200px/.test(h2))
  t.ok(/width="200"/.test(h2))
})
tap.test('Box - style', async t => {
  const h = render(<Box style={{ border: '1px solid black' }}>Hello</Box>)
  t.ok(/border:1px solid black/.test(h))
})

tap.test('Box - base', async t => {
  t.ok(/Hello/.test(render(<Box>Hello</Box>)))
})
tap.test('Box - bg', async t => {
  const html = render(<Box bg='tomato'>Hello</Box>)
  t.ok(/bgcolor="tomato"/.test(html))
  t.ok(/background-color:tomato/.test(html))
})
tap.test('Box - p', async t => {
  const html = render(<Box p={0}>Hello</Box>)
  t.ok(/padding-top:0/.test(html))
})
tap.test('Box - table props are passed down', async t => {
  t.ok(/color:white/.test(render(<Box c='white'>Hello</Box>)))
  t.ok(/align="center"/.test(render(<Box a='center'>Hello</Box>)))
  t.ok(/background-color:tomato/.test(render(<Box bg='tomato'>Hello</Box>)))
})

tap.test('Type', async t => {
  const h = render(<Type>Hello</Type>)

  // base style
  t.ok(/text-align/.test(h))
  t.ok(/mso-line-height-rule/.test(h))
  t.ok(/font-style/.test(h))
  t.ok(/width/.test(h))

  // base themed style
  t.ok(/color:inherit/.test(h))
  t.ok(/font-size:14px/.test(h))
  t.ok(/font-weight:normal/.test(h))
})

tap.test('Type - custom values', async t => {
  const h = render(
    <Type fs={1} c='black'>
      Hello
    </Type>
  )
  t.ok(/font-size:32px/.test(h))
  t.ok(/color:#333/.test(h))
})
