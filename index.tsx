import React from 'react'

type StrNum = string | number

export type RemailComponent<T = HTMLElement> = React.PropsWithChildren<
  Partial<Shorthands> & Partial<React.AllHTMLAttributes<T>>
>

export type ThemeScale =
  | number[]
  | string[]
  | {
      [k: string]: StrNum
    }

export type ThemeConfig = {
  space: ThemeScale
  color: ThemeScale
  fontFamily: ThemeScale
  fontSize: ThemeScale
  lineHeight: ThemeScale
  fontWeight: ThemeScale
}

export type Shorthands = {
  a: string
  c: string | string[]
  bg: string | string[]
  p: StrNum | StrNum[]
  pt: StrNum | StrNum[]
  pb: StrNum | StrNum[]
  pl: StrNum | StrNum[]
  pr: StrNum | StrNum[]
  py: StrNum | StrNum[]
  px: StrNum | StrNum[]
  mx: StrNum | StrNum[]
  ff: string | string[]
  fs: StrNum | StrNum[]
  fw: StrNum | StrNum[]
  lh: StrNum | StrNum[]
  w: StrNum | StrNum[]
  h: StrNum | StrNum[]
  d: string | string[]
  va: string | string[]
}

export type ThemeProps = React.PropsWithChildren<Partial<ThemeConfig>>
export type BoxProps<T = HTMLElement> = RemailComponent<T>
export type TypeProps = RemailComponent & {
  italic?: boolean
  bold?: boolean
}
export type ImgProps = RemailComponent<HTMLImageElement> & {
  href?: string
}
export type ColumnsProps = Omit<RemailComponent, 'wrap'> & {
  wrap?: boolean
}
export type ColumnProps = ColumnsProps
export type ButtonProps = RemailComponent & {
  href: string
  title?: string
}

// use to generate classnames, reset after getMobileCss is called
let id = 0

// singleton, aggregates mobile styles
let css: {
  [className: string]: {
    properties: string[]
    value: string
  }[]
} = {}

export const defaultTheme: ThemeConfig = {
  space: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64],
  color: {
    black: '#333',
  },
  fontFamily: {
    sans: '-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: 'georgia, serif',
  },
  fontSize: [32, 32, 21, 18, 16, 14, 12],
  lineHeight: [40, 40, 24, 24, 24, 20, 16],
  fontWeight: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900],
}

// registry of attr aliases -> properties and theme scale
export const shorthands: {
  [shorthand: string]: {
    properties: string[]
    theme?: keyof ThemeConfig
    unit?: (v: any) => string
  }
} = {
  c: {
    properties: ['color'],
    theme: 'color',
  },
  bg: {
    properties: ['backgroundColor'],
    theme: 'color',
  },
  p: {
    properties: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
    theme: 'space',
    unit: toPx,
  },
  pt: {
    properties: ['paddingTop'],
    theme: 'space',
    unit: toPx,
  },
  pb: {
    properties: ['paddingBottom'],
    theme: 'space',
    unit: toPx,
  },
  pl: {
    properties: ['paddingLeft'],
    theme: 'space',
    unit: toPx,
  },
  pr: {
    properties: ['paddingRight'],
    theme: 'space',
    unit: toPx,
  },
  py: {
    properties: ['paddingTop', 'paddingBottom'],
    theme: 'space',
    unit: toPx,
  },
  px: {
    properties: ['paddingLeft', 'paddingRight'],
    theme: 'space',
    unit: toPx,
  },
  mx: {
    properties: ['marginLeft', 'marginRight'],
    theme: 'space',
    unit: toPx,
  },
  ff: {
    properties: ['fontFamily'],
    theme: 'fontFamily',
  },
  fs: {
    properties: ['fontSize'],
    theme: 'fontSize',
    unit: toPx,
  },
  fw: {
    properties: ['fontWeight'],
    theme: 'fontWeight',
  },
  lh: {
    properties: ['lineHeight'],
    theme: 'lineHeight',
    unit: toPx,
  },
  w: {
    properties: ['width'],
    unit: toPx,
  },
  h: {
    properties: ['height'],
    unit: toPercOrPx,
  },
  d: {
    properties: ['display'],
  },
  va: {
    properties: ['verticalAlign'],
  },
}

function toPx(v: string | number) {
  return v + 'px'
}

function toPercOrPx(v: number) {
  return v <= 1 ? v * 100 + '%' : v + 'px'
}

function isPixelString(value: string | number) {
  if (typeof value !== 'string') return false
  return /^[0-9]+(?:px)*$/.test(value)
}

export function sanitizeSizeUnits(value: string | number) {
  return isPixelString(value) ? parseInt(value as string) : value
}

export function computeValue(value: string | number, themeValues: ThemeScale = {}, toUnit?: (v: any) => string) {
  // @ts-ignore
  const themeValue: string | number = themeValues ? themeValues[value] : value
  const rawValue = themeValue || value
  const normalizedValue = sanitizeSizeUnits(rawValue)

  return typeof normalizedValue === 'number' && toUnit ? toUnit(normalizedValue) : normalizedValue + ''
}

// gets raw CSS tree, pre-conversion to CSS
export function getMobileStyleTree() {
  const value = css
  css = {}
  id = 10
  return value
}

// converts a CSS tree to CSS within a given max-width breakpoint
export function getMobileCss({ breakpoint = '600px' } = {}) {
  const tree = getMobileStyleTree()

  let sheet = ''

  for (const className of Object.keys(tree)) {
    sheet += `.${className} {`

    for (const { properties, value } of tree[className]) {
      for (const property of properties) {
        sheet += `${property.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()}:${value} !important;`
      }
    }

    sheet += '}'
  }

  return `@media (max-width:${breakpoint}){${sheet}}`
}

// extracts themeable component props as style, rest as attr
export function decomposeProps(props: { [attribute: string]: any }, theme: ThemeConfig) {
  let attr: { [attribute: string]: any } = {}
  let style: { [attribute: string]: any } = {}
  const className = '_' + (id++).toString(16)

  for (const prop of Object.keys(props)) {
    const config = shorthands[prop]

    // any props besides style should drop through
    if (!config) {
      if (prop !== 'style') attr[prop] = props[prop]
      continue
    }

    const [value, mobileValue] = [].concat(props[prop])
    const themeValues = config.theme ? theme[config.theme] : undefined
    const computed = computeValue(value, themeValues, config.unit)

    if (mobileValue !== undefined) {
      css[className] = css[className] || []
      css[className].push({
        properties: config.properties,
        value: computeValue(mobileValue, themeValues, config.unit),
      })
    }

    for (const property of config.properties) {
      style[property] = computed

      if (/width|height/.test(property)) {
        attr[property] = sanitizeSizeUnits(computed)
      }
    }
  }

  // merge and override with style attribute def if exists
  Object.assign(style, props.style || {})

  return { attr, style, className }
}

export function createDocument({
  lang = 'en',
  title,
  css,
  head,
  headCss,
  bodyCss,
  body,
}: {
  lang?: string
  title: string
  css?: string
  head?: string
  headCss?: string
  bodyCss?: string
  body: string
}) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="${lang}" xml:lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>${title}</title>

    ${head ? head : ''}
    ${css ? `<style type="text/css">${css}</style>` : ''}
    ${headCss ? `<style type="text/css">${headCss}</style>` : ''}
  </head>

  <body style="width:100%; margin:0; padding:0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust:100%;">
    ${css ? `<style type="text/css">${css}</style>` : ''}
    ${bodyCss ? `<style type="text/css">${bodyCss}</style>` : ''}

    ${body}
  </body>
</html>
  `
}

export const ThemeContext = React.createContext(defaultTheme)

export function Theme({ children, ...props }: ThemeProps) {
  return (
    <ThemeContext.Provider
      value={{
        ...defaultTheme,
        ...props,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function Box({ a = 'left', children, ...props }: BoxProps) {
  const theme = React.useContext(ThemeContext)

  props.w = props.w || (a === 'center' ? 'auto' : '100%')

  const { className, attr, style } = decomposeProps(props, theme)
  const bg = style.backgroundColor || 'transparent'

  return (
    <table
      className={className}
      cellPadding="0"
      cellSpacing="0"
      // @ts-ignore - deprecated but needed
      border="0"
      align={a}
      style={{
        tableLayout: 'fixed',
        margin: a === 'center' ? '0 auto' : 0,
        backgroundColor: bg,
        ...style,
      }}
      {...attr}
    >
      <tr>
        <td
          // @ts-ignore - deprecated but needed
          bgcolor={bg}
        >
          {children}
        </td>
      </tr>
    </table>
  )
}

export function Type({ a = 'left', italic, bold, style = {}, children, ...props }: TypeProps) {
  // default values
  const attr = {
    a,
    c: 'inherit',
    ff: 'sans',
    fs: 5,
    fw: bold ? 'bold' : 'normal',
    style: {
      textAlign: a as any,
      msoLineHeightRule: 'exactly',
      fontStyle: italic ? 'italic' : 'normal',
      ...style,
    },
    ...props,
  }

  return <Box {...attr}>{children}</Box>
}

export function Img({ src, alt, href, ...props }: ImgProps) {
  const theme = React.useContext(ThemeContext)
  const { className, attr, style } = decomposeProps(
    {
      h: 'auto',
      ...props,
    },
    theme
  )

  const img = (
    <img
      className={className}
      alt={alt}
      src={src}
      style={{
        display: 'block',
        outline: 'none',
        border: 'none',
        textDecoration: 'none',
        ...style,
      }}
      {...attr}
    />
  )

  return href ? (
    <a href={href} title={alt}>
      {img}
    </a>
  ) : (
    img
  )
}

export function Columns({ wrap = false, children, ...props }: ColumnsProps) {
  return (
    <Box {...props}>
      <table
        cellPadding="0"
        cellSpacing="0"
        // @ts-ignore - deprecated but needed
        border="0"
        style={{
          tableLayout: 'auto', // override default of 'fixed'
        }}
        width="100%" // fill container
      >
        <tr>
          {React.Children.toArray(children).map((child) => {
            if (!React.isValidElement(child)) return null
            return React.cloneElement(child, {
              ...child.props,
              wrap,
            })
          })}
        </tr>
      </table>
    </Box>
  )
}

export function Column({ wrap, children, ...props }: ColumnProps) {
  const theme = React.useContext(ThemeContext)

  if (wrap) props.d = ['table-cell', 'block']

  const { className, attr, style } = decomposeProps(
    {
      va: 'top',
      ...props,
    },
    theme
  )

  return (
    <td
      className={className}
      style={style}
      {...{
        ...attr,
      }}
    >
      {children}
    </td>
  )
}

export function Button({ href, title, children, ...props }: ButtonProps) {
  return (
    <Box w="100%">
      <a href={href} title={title} target="_blank" style={{ display: 'block', width: 'auto', textDecoration: 'none' }}>
        <Box w="auto" {...props}>
          {children}
        </Box>
      </a>
    </Box>
  )
}
