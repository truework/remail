import merge from "deepmerge";
import React from "react";

import { properties as defaultCssProps } from "./properties";
import { isPxStr } from "./utils";
import * as presets from "./presets";

export type AnyKeyValue = Record<string, any>;
export type Unitless = string | number;
export type UnitlessKeyValue = Record<string, Unitless>;
export type CSSPropertyNames = keyof React.CSSProperties;
export type RemailElementStyleAttributeValue =
  | Unitless[]
  | Unitless
  | boolean
  | undefined;
export type RemailElementStyleAttributes =
  | { [property in CSSPropertyNames]?: RemailElementStyleAttributeValue }
  | { [property: string]: RemailElementStyleAttributeValue };
export type RemailElementAttributes = AnyKeyValue &
  RemailElementStyleAttributes;

/**
 * Theme
 */
export type ThemeTokens = {
  [property in CSSPropertyNames]?: Unitless | Unitless[] | UnitlessKeyValue;
} & {
  space?: Unitless | Unitless[] | UnitlessKeyValue;
};
export type ThemeShorthands = {
  [shorthand: string]: CSSPropertyNames | CSSPropertyNames[];
};
export type ThemeMacros = {
  [macro: string]: RemailElementStyleAttributes;
};
export type ThemeVariants = {
  [variation: string]: {
    [name: string]: RemailElementStyleAttributes;
  };
};
export type ThemeProperties = {
  [property in CSSPropertyNames]?: {
    token?: keyof ThemeTokens;
    unit?(value: any): string;
  };
};
export interface UserTheme {}
export type Theme = {
  tokens: ThemeTokens;
  shorthands: ThemeShorthands;
  macros: ThemeMacros;
  variants: ThemeVariants;
  properties: ThemeProperties;
} & UserTheme;

/**
 * Context
 */
export type RemailContext = ReturnType<typeof createRemail>;

/**
 * Components
 */
type PartialHTMLElement<T = HTMLElement> = Partial<
  Omit<T, "children" | "style">
>;
export type AlignmentProps = { a?: "left" | "right" | "center" };
export type StyleProps = {
  style?: { [property in CSSPropertyNames]?: string | number };
};
export type BoxProps<T = HTMLTableElement> = RemailElementAttributes &
  AlignmentProps &
  StyleProps &
  PartialHTMLElement<T>;
export type TypeProps = BoxProps & {
  italic?: boolean;
  bold?: boolean;
};
export type ImgProps = Omit<BoxProps<HTMLImageElement>, "a"> & {
  href?: string;
};
export type ColumnsProps = BoxProps & { wrap?: boolean };
export type ColumnProps = BoxProps<HTMLTableDataCellElement>;
export type ButtonProps = BoxProps & {
  href: string;
  title?: string;
};

// use to generate classnames
let id = 0;
const contextError =
  "Looks like a Remail was component used outside of a Remail Provider context. Make sure your wrap your components in <Provider />.";

function toCSS(classname: string, property: string, value: string) {
  return (
    classname +
    "{" +
    property.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase() +
    ":" +
    value +
    " !important" +
    "}"
  );
}

/**
 * Expand macros and variants, then expand all shorthand props.
 *
 * Returns a hypostyle object
 */
export function explode(
  props: RemailElementAttributes,
  theme: Theme
): RemailElementAttributes {
  var attr: RemailElementAttributes = {};

  // expand macros and variants, copy other props
  for (var prop in props) {
    /* c8 ignore next */
    if (!props.hasOwnProperty(prop)) continue; // skip proto

    // macro exists AND prop is true
    if (theme.macros[prop] && (props[prop] === true || props[prop] === false)) {
      if (props[prop] === true) attr = merge(attr, theme.macros[prop]);
    } else if (theme.variants[prop]) {
      attr = merge(attr, theme.variants[prop][props[prop] as string]);
    } else {
      attr[prop] = props[prop];
    }
  }

  // recursively expand all shorthands
  for (var prop in attr) {
    /* c8 ignore next */
    if (!attr.hasOwnProperty(prop)) continue; // skip proto

    var value = attr[prop];

    if (theme.shorthands[prop]) {
      var shorthands = ([] as string[]).concat(theme.shorthands[prop]);

      for (var i = 0; i < shorthands.length; i++) {
        // give preference to non-shorthand defs if exist
        if (!attr[shorthands[i]]) attr[shorthands[i]] = value;
      }

      delete attr[prop]; // remove shorthand key
    } else {
      attr[prop] = value;
    }
  }

  return attr;
}

/**
 * Accepts a style object and converts it to a CSS object intelligible by
 * any CSS-in-JS library that supports objects.
 */
export function decomposeProps(props: RemailElementAttributes, theme: Theme) {
  let css = "";
  const classnames: string[] = [];
  const styles: { [property: string]: Unitless } = {};
  const attributes: AnyKeyValue = {};

  const pending: RemailElementAttributes = {};

  // pick out style props vs attributes
  for (const prop of Object.keys(props)) {
    if (
      theme.macros[prop] ||
      theme.variants[prop] ||
      theme.shorthands[prop] ||
      theme.properties[prop as CSSPropertyNames]
    ) {
      pending[prop] = props[prop];
    } else {
      attributes[prop] = props[prop] as string;
    }
  }

  for (const prop of Object.keys(pending)) {
    const { token, unit } = theme.properties[prop as CSSPropertyNames] || {};
    const tokens = token ? theme.tokens[token] : null;
    const values = ([] as Unitless[]).concat(props[prop]);

    // [desktop, mobile]
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      // @ts-ignore — tokens can be arr/object
      const tokenValue: Unitless = tokens ? tokens[value] || value : value;
      const unitValue = unit ? unit(tokenValue) : tokenValue;

      // drop undefined values, all others pass through
      if (unitValue === undefined) continue;

      if (i === 0) {
        styles[prop] = unitValue;

        // style props that should also be attributes
        if (["width", "height"].includes(prop)) {
          const val = String(unitValue);
          attributes[prop] = isPxStr(val) ? parseInt(val) + "" : val;
        }
      } else {
        const classname = "_" + (id++).toString(16);

        classnames.push(classname);

        css += toCSS("." + classname, prop, unitValue + "");
      }
    }
  }

  return {
    css,
    classnames,
    styles: styles as React.CSSProperties,
    attributes,
  };
}

export function createTheme(theme: Partial<Theme> = presets): Theme {
  return {
    tokens: {},
    macros: {},
    variants: {},
    shorthands: {},
    ...theme,
    properties: {
      ...defaultCssProps,
      ...(theme.properties || {}),
    },
  };
}

export function createRemail({ theme }: { theme?: Partial<Theme> } = {}) {
  const t = createTheme(theme);
  let css = "@media (max-width: 600px) {";

  return {
    get theme() {
      return t;
    },
    addMobileCss(value: string) {
      css += value;
    },
    flushMobileCss() {
      const c = css.slice();
      css = "";
      return c + "}";
    },
  };
}

export const ThemeContext = React.createContext<RemailContext>(
  {} as RemailContext
);

export function Provider({
  children,
  value,
}: React.PropsWithChildren<{ value: RemailContext }>) {
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useRemail() {
  return React.useContext(ThemeContext);
}

export function Box({
  a = "left",
  children,
  ...props
}: React.PropsWithChildren<BoxProps>) {
  const remail = useRemail();

  if (!remail.theme) {
    throw new Error(contextError);
  }

  props.w = props.w || (a === "center" ? "auto" : "100%");

  const { classnames, attributes, styles, css } = decomposeProps(
    explode(props, remail.theme),
    remail.theme
  );
  const bg = styles.background || "transparent";

  remail.addMobileCss(css);

  return (
    <table
      cellPadding="0"
      cellSpacing="0"
      // @ts-ignore - deprecated but needed
      border="0"
      // @ts-ignore - deprecated but needed
      align={a}
      {...attributes}
      className={classnames.join(" ")}
      style={{
        ...(attributes.style || {}),
        tableLayout: "fixed",
        margin: a === "center" ? "0 auto" : 0,
        background: bg,
        ...styles,
      }}
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
  );
}

export function Type({
  a = "left",
  italic,
  bold,
  style = {},
  children,
  ...props
}: React.PropsWithChildren<TypeProps>) {
  // default values
  const attr = {
    a,
    w: "100%", // should be 100% unless overridden by user
    c: "inherit",
    ff: "sans",
    fs: 5,
    fw: bold ? "bold" : "normal",
    style: {
      textAlign: a as any,
      msoLineHeightRule: "exactly",
      fontStyle: italic ? "italic" : "normal",
      ...style,
    },
    ...props,
  };

  return <Box {...attr}>{children}</Box>;
}

export function Img({
  src,
  alt,
  href,
  ...props
}: React.PropsWithChildren<ImgProps>) {
  const remail = useRemail();

  if (!remail.theme) {
    throw new Error(contextError);
  }

  const { classnames, attributes, styles, css } = decomposeProps(
    explode(
      {
        h: "auto",
        ...props,
      },
      remail.theme
    ),
    remail.theme
  );

  remail.addMobileCss(css);

  const img = (
    <img
      {...attributes}
      className={classnames.join(" ")}
      alt={alt}
      src={src}
      style={{
        display: "block",
        outline: "none",
        border: "none",
        textDecoration: "none",
        ...styles,
      }}
    />
  );

  return href ? (
    <a href={href} title={alt}>
      {img}
    </a>
  ) : (
    img
  );
}

export function Columns({
  wrap = false,
  children,
  ...props
}: React.PropsWithChildren<ColumnsProps>) {
  return (
    <Box {...props}>
      <table
        cellPadding="0"
        cellSpacing="0"
        // @ts-ignore - deprecated but needed
        border="0"
        style={{
          tableLayout: "auto", // override default of 'fixed'
        }}
        width="100%" // fill container
      >
        <tr>
          {React.Children.toArray(children).map((child) => {
            if (!React.isValidElement(child)) return null;
            return React.cloneElement(child, {
              ...child.props,
              wrap,
            });
          })}
        </tr>
      </table>
    </Box>
  );
}

export function Column({
  wrap,
  children,
  ...props
}: React.PropsWithChildren<ColumnProps>) {
  const remail = useRemail();

  if (!remail.theme) {
    throw new Error(contextError);
  }

  if (wrap) props.d = ["table-cell", "block"];

  const { classnames, attributes, styles, css } = decomposeProps(
    explode(
      {
        va: "top",
        ...props,
      },
      remail.theme
    ),
    remail.theme
  );

  remail.addMobileCss(css);

  return (
    <td {...attributes} className={classnames.join(" ")} style={styles}>
      {children}
    </td>
  );
}

export function Button({
  href,
  title,
  children,
  ...props
}: React.PropsWithChildren<ButtonProps>) {
  return (
    <Box w="100%">
      <a
        href={href}
        title={title}
        target="_blank"
        style={{ display: "block", width: "auto", textDecoration: "none" }}
      >
        <Box w="auto" {...props}>
          {children}
        </Box>
      </a>
    </Box>
  );
}

export function createDocument({
  lang = "en",
  title,
  css,
  head,
  headCss,
  bodyCss,
  body,
}: {
  lang?: string;
  title: string;
  css?: string;
  head?: string;
  headCss?: string;
  bodyCss?: string;
  body: string;
}) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="${lang}" xml:lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>${title}</title>

    ${head ? head : ""}
    ${css ? `<style type="text/css">${css}</style>` : ""}
    ${headCss ? `<style type="text/css">${headCss}</style>` : ""}
  </head>

  <body style="width:100%; margin:0; padding:0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust:100%;">
    ${css ? `<style type="text/css">${css}</style>` : ""}
    ${bodyCss ? `<style type="text/css">${bodyCss}</style>` : ""}

    ${body}
  </body>
</html>
  `;
}
