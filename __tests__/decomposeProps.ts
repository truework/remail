import tap from 'tap'

import * as Lib from '../'

const { decomposeProps, defaultTheme } = Lib

tap.test('ignores non-custom values', async (t) => {
  const { attr } = decomposeProps(
    {
      width: '500px',
    },
    defaultTheme
  )

  t.ok(attr.width === '500px')
})

tap.test('values in theme', async (t) => {
  const { style } = decomposeProps(
    {
      c: 'black',
      p: 2,
    },
    defaultTheme
  )

  // @ts-ignore
  t.ok(style.color === defaultTheme.color.black)
  t.ok(style.paddingTop === '8px')
})

tap.test('values not in theme', async (t) => {
  const { style } = decomposeProps(
    {
      c: 'blue',
      p: 20,
    },
    defaultTheme
  )

  t.ok(style.color === 'blue')
  t.ok(style.paddingTop === '20px')
})

tap.test('string numbers', async (t) => {
  const { style } = decomposeProps(
    {
      lh: '1',
    },
    defaultTheme
  )

  t.ok(style.lineHeight !== '1')
  t.ok(/[0-9]px/.test(style.lineHeight))
})

tap.test('toUnit', async (t) => {
  const { style } = decomposeProps(
    {
      fw: 9,
    },
    defaultTheme
  )

  t.ok(style.fontWeight === '900')
})

tap.test('decomposeProps - width int', async (t) => {
  const { attr, style } = decomposeProps(
    {
      w: 200,
    },
    defaultTheme
  )

  t.ok(style.width === '200px')
  t.ok(attr.width === 200)
})

tap.test('decomposeProps - width unitless string', async (t) => {
  const { attr, style } = decomposeProps(
    {
      w: '200',
    },
    defaultTheme
  )

  t.ok(style.width === '200px')
  t.ok(attr.width === 200)
})

tap.test('decomposeProps - width string', async (t) => {
  const { attr, style } = decomposeProps(
    {
      w: '200px',
    },
    defaultTheme
  )

  t.ok(style.width === '200px')
  t.ok(attr.width === 200)
})

tap.test('decomposeProps - width percent', async (t) => {
  const { attr, style } = decomposeProps(
    {
      w: '100%',
    },
    defaultTheme
  )

  t.ok(style.width === '100%')
  t.ok(attr.width === '100%')
})
