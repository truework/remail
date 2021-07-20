# remail

## Contents

- [Overview](#overview)
- [Shorthands](#shorthands)
- [Theme](#theme)
- [Components](#components)
  - [Theme](#theme)
  - [Box](#box)
  - [Type](#type)
  - [Img](#img)
  - [Columns & Column](#columns-column)
  - [Button](#button)
- [Utils](#utils)
- [Tips & FAQs](#tips-faqs)

## Overview

The components herein are inspired by patterns we've been using in our main
application, via `styled-components` and `styled-system`, so the syntax should
look familiar.

## Shorthands

Like `styled-system`, this library supports property shorthands to aid in layout
and styling. Email has some very specific constraints, and some properties do
double duty. So, the shorthand properties vary slightly from what you'd expect
in a normal CSS3 project.

For instance, instead of something like `backgroundColor`, here we just use
`bg`, which sets both CSS `background-color` and (deprecated, but required) HTML
`table` attribute `bgcolor`.

The following shorthands – and the CSS properties the generate – are available:

- c - color
- bg - backgroundColor
- p - paddingTop, paddingBottom, paddingLeft, paddingRight
- pt - paddingTop
- pb - paddingBottom
- pl - paddingLeft
- pr - paddingRight
- py - paddingTop, paddingBottom
- px - paddingLeft, paddingRight
- mx - marginLeft, marginRight
- ff - fontFamily
- fs - fontSize
- fw - fontWeight
- lh - lineHeight
- w - width
- h - height
- d - display
- va - verticalAlign

#### Responsive Syntax

Also like `styled-system`, most properties support array-based responsive
styles. The big difference here is, the order is inversed.

Because most email clients don't support `@media` queries, we can't use
`min-width` based media queries, as we normall would. And since we're talking
email, we really only need a single breakpoint anyway: `<600px`.

For example, to set _default_ padding _and_ mobile padding (for those clients
that support it), it would look like this: `p={[12, 8]}`.

## Theme

Included here is a base theme, but we've added onto it in the `/src` directory
to add our company colors, etc. There are a few differences between this library
and our application.

#### Integers

Instead of pixel values for `space`, `fontSize`, `fontWeight`, and `lineHeight`,
everything is an integer.

#### Order

Theme values are/should be ordered in a _guessable_ way. Example: h1 styling
should be located at index `1` so that we can use it like `fs={1}`.

#### Space Scale

These are in increments of `4`, and are also ordered by index. This way, if we
want, say, 20px of space, we can think `x * 4 = 20` where `x = 5`. So `p={5}` is
`padding: 20px`.

## Components

#### Theme

Just like `ThemeProvider` from `styled-components`.

```jsx
import { Theme } from '@/lib'

const theme = {
  colors: {
    primary: '#5B63FE',
  },
}

export function Page() {
  return <Theme {...theme}>...</Theme>
}
```

#### Box

The general-purpose catch-all. You'll use this the most. Supports all
shorthands.

Notes:

- supports alignment via prop `a` and values `left` (default), `center`, and
  `right`

```jsx
import { Box } from '@/lib'

export function Page() {
  return (
    <Box a="center" c="primary" p={[12, 8]}>
      Centered blue text
    </Box>
  )
}
```

#### Type

Low-level building block for typography. Probably don't need to use this
directly, since we have `@/src/components/Typography` to pull from. Supports
most shorthands.

Notes:

- also supports alignment, which applies `text-align` too
- supports some type-specific helpers like `bold`

```jsx
import { Type } from '@/lib'

export function Page() {
  return (
    <Type bold italic a="center" c="primary">
      Centered blue bold italic text
    </Type>
  )
}
```

#### Img

Only outputs an `img` tag, but will wrap it in an `a` tag if you provide an
`href` value. Supports some shorthands, but again, only outputs an `img` tag. If
you need more, wrap this in a `Box`.

```jsx
import { Img } from '@/lib'

export function Page() {
  return <Img href="https://truework.com" src="/static/image.png" alt="Some Image" w={140} />
}
```

#### Columns & Column

Use these together to create horizontal layouts.

Notes:

- `wrap` is a very special prop that provides CSS, attribute, and mobile styles
  to both the parent `Columns` and child `Column`
- without `wrap`, columns that sum to greater than 100% will break on mobile
- `Column` must be a direct descendant of `Columns`
- `va` translates to `vertical-align` and `valign`

```jsx
import { Columns, Column } from '@/lib'

export function Page() {
  return (
    <Columns wrap>
      <Column va="center" w={[1 / 2, 1]}>
        50% wide on desktop, 100% wide on mobile
      </Column>
      <Column va="center" w={[1 / 2, 1]}>
        50% wide on desktop, 100% wide on mobile
      </Column>
    </Columns>
  )
}
```

#### Button

Basically allows button-like styling and alignment using a combination of `Box`
and `a` tags, along with a couple default styles that can be overridden.

Again, we've got our own `Buttons` in `@/src/components/Button`, so you probably
don't need to use this.

```jsx
import { Button } from '@/lib'

export function Page() {
  return (
    <Button a="center" href="https://truework.com">
      Centered CTA
    </Button>
  )
}
```

## Utilties

There are two utilities you should know about, and both are used in the build script.

#### getMobileCss

_After_ you've rendered a template with `renderToStaticMarkup`, mobile CSS is
gathered on an object. To extract this style cache, call `getMobileCss()`. The
resulting string can be injected into your finished HTML document.

#### createDocument

This util generates the full HTML document required for email clients. It
supports the following props:

- `lang` - `string` - defaults to `en`
- `title` - `string` - the email title (subject line)
- `css` - `string` - styles to inject into the `head` and the `body`
- `head` - `string` - any `meta` tags you need to add
- `headCss` - `string` - styles to inject into the head only
- `bodyCss` - `string` - styles to inject into the body only
- `body` - `string` - the main body of your email template

## Tips & FAQs

#### Composition

As a general note, rely on composition where you need to. Use the components for
what they're _specifically_ for, and wrap them in helpers to deal with spacing
and alignment.

For example, when defining columns, even though technically you can define
spacing on `Columns` itself, it can also mess up your maths when calculating
`Column` widths. Maybe a safer way to do it is like this:

```jsx
<Box py={8}>
  <Columns>...</Columns>
</Box>
```

Similarly, since `Img` is just an `img` tag, you'll probably need a `Box` to
align it or add spacing:

```jsx
<Box a="center" py={8}>
  <Img src="/centered-image.jpg" />
</Box>
```
