import uvu from "uvu";
import * as assert from "uvu/assert";
import React from "react";
import { renderToStaticMarkup as render } from "react-dom/server";

import {
  createRemail as create,
  createTheme,
  Provider,
  Box,
  Type,
  Img,
  explode,
  decomposeProps,
  presets,
} from "../index";

/*
 *
 * Suite
 *
 */

const test = uvu.suite("remail");

/*
 *
 * Tests
 *
 */

test("explode", async () => {
  const props = explode(
    {
      w: "500px",
      width: 1,
      mt: [1, 2],
      theme: "blue",
      ac: true,
      charset: "utf8",
    },
    createTheme({
      shorthands: {
        c: "color",
        w: ["width"],
        mt: ["marginTop"],
      },
      macros: {
        ac: {
          align: "center",
          textAlign: "center",
        },
      },
      variants: {
        theme: {
          blue: {
            c: "blue",
          },
        },
      },
    })
  );

  assert.equal(props, {
    width: 1,
    align: "center",
    textAlign: "center",
    marginTop: [1, 2],
    color: "blue",
    charset: "utf8",
  });
});

test("decomposeProps", async () => {
  const props = decomposeProps(
    {
      width: 1,
      marginTop: [1, 2],
      src: "",
      charset: "",
    },
    createTheme(presets)
  );

  assert.equal(props, {
    css: "._0{margin-top:8px !important}",
    styles: {
      width: "100%",
      marginTop: "4px",
    },
    attributes: {
      src: "",
      charset: "",
      width: "100%",
    },
    classnames: ["_0"],
  });

  assert.equal(props.attributes.width, "100%");
});

test("decomposeProps - values in theme", async () => {
  const theme = createTheme({
    ...presets,
    tokens: {
      ...presets.tokens,
      color: {
        black: "black",
      },
    },
  });
  const { styles } = decomposeProps(
    explode(
      {
        c: "black",
        p: 2,
      },
      theme
    ),
    theme
  );

  assert.equal(styles.color, "black");
  assert.equal(styles.paddingTop, "8px");
});

test("decomposeProps - values not in theme", async () => {
  const theme = createTheme();
  const { styles } = decomposeProps(
    explode(
      {
        c: "blue",
        p: 20,
      },
      theme
    ),
    theme
  );

  assert.equal(styles.color, "blue");
  assert.equal(styles.paddingTop, "20px");
});

test("decomposeProps - string numbers", async () => {
  const theme = createTheme();
  const { styles } = decomposeProps(
    explode(
      {
        lh: "1",
      },
      theme
    ),
    theme
  );

  assert.not.equal(styles.lineHeight, "1");
  assert.equal(styles.lineHeight, 1.1);
});

test("decomposeProps - toUnit", async () => {
  const theme = createTheme();
  const { styles } = decomposeProps(
    explode(
      {
        fw: 9,
      },
      theme
    ),
    theme
  );

  assert.equal(styles.fontWeight, "900");
});

test("decomposeProps - width int", async () => {
  const theme = createTheme();
  const { attributes, styles } = decomposeProps(
    explode(
      {
        w: 200,
      },
      theme
    ),
    theme
  );

  assert.equal(styles.width, "200px");
  assert.equal(attributes.width, "200");
});

test("decomposeProps - width unitless string", async () => {
  const theme = createTheme();
  const { attributes, styles } = decomposeProps(
    explode(
      {
        w: "200",
      },
      theme
    ),
    theme
  );

  assert.equal(styles.width, "200px");
  assert.equal(attributes.width, "200");
});

test("decomposeProps - width string", async () => {
  const theme = createTheme();
  const { attributes, styles } = decomposeProps(
    explode(
      {
        w: "200px",
      },
      theme
    ),
    theme
  );

  assert.equal(styles.width, "200px");
  assert.equal(attributes.width, "200");
});

test("decomposeProps - width percent", async () => {
  const theme = createTheme();
  const { attributes, styles } = decomposeProps(
    explode(
      {
        w: "100%",
      },
      theme
    ),
    theme
  );

  assert.equal(styles.width, "100%");
  assert.equal(attributes.width, "100%");
});

test("flushMobileCss", async () => {
  const remail = create();

  render(
    <Provider value={remail}>
      <Box c={["black", "tomato"]}>Hello</Box>
    </Provider>
  );

  const cssOne = remail.flushMobileCss();

  assert.ok(cssOne.includes("tomato !important"));
  assert.ok(cssOne.includes("@media (max-width: 600px)"));

  render(
    <Provider value={remail}>
      <Box c={["black", "whitesmoke"]}>Hello</Box>
    </Provider>
  );
  const cssTwo = remail.flushMobileCss();

  assert.not.ok(cssTwo.includes("tomato")); // flushed out already
  assert.ok(cssTwo.includes("whitesmoke"));
});

test("Box - base", async () => {
  const remail = create();
  const h = render(
    <Provider value={remail}>
      <Box>Hello</Box>
    </Provider>
  );
  assert.ok(/Hello/.test(h));
  assert.ok(/width:100%/.test(h));
});

test("Box - a", async () => {
  const remail = create();
  const h = render(
    <Provider value={remail}>
      <Box a="center">Hello</Box>
    </Provider>
  );
  assert.ok(/align="center"/.test(h));
  assert.ok(/margin:0 auto/.test(h));
  assert.ok(/width:auto/.test(h));
});

test("Box - w", async () => {
  const remail = create();
  const h = render(
    <Provider value={remail}>
      <Box w={200}>Hello</Box>
    </Provider>
  );
  assert.ok(/width:200px/.test(h));
  assert.ok(/width="200"/.test(h));
  const h2 = render(
    <Provider value={remail}>
      <Box w="200px">Hello</Box>
    </Provider>
  );
  assert.ok(/width:200px/.test(h2));
  assert.ok(/width="200"/.test(h2));
});

test("Box - style", async () => {
  const remail = create();
  const h = render(
    <Provider value={remail}>
      <Box style={{ border: "1px solid black" }}>Hello</Box>
    </Provider>
  );
  assert.ok(/border:1px solid black/.test(h));
});

test("Box - base", async () => {
  assert.ok(
    /Hello/.test(
      render(
        <Provider value={create()}>
          <Box>Hello</Box>
        </Provider>
      )
    )
  );
});

test("Box - bg", async () => {
  const remail = create();
  const h = render(
    <Provider value={remail}>
      <Box bg="tomato">Hello</Box>
    </Provider>
  );
  assert.ok(/bgcolor="tomato"/.test(h));
  assert.ok(/background:tomato/.test(h));
});

test("Type", async () => {
  const remail = create();
  const h = render(
    <Provider value={remail}>
      <Type>Hello</Type>
    </Provider>
  );

  // base style
  assert.ok(/text-align/.test(h));
  assert.ok(/mso-line-height-rule/.test(h));
  assert.ok(/font-style/.test(h));
  assert.ok(/width="100%"/.test(h));
  assert.ok(/width:100%/.test(h));

  // base themed style
  assert.ok(/color:inherit/.test(h));
  assert.ok(/font-size:1rem/.test(h));
  assert.ok(/font-weight:normal/.test(h));
});

test("Type - custom values", async () => {
  const remail = create();
  const h = render(
    <Provider value={remail}>
      <Type fs={1} c="black">
        Hello
      </Type>
    </Provider>
  );
  assert.ok(/font-size:3rem/.test(h));
  assert.ok(/color:black/.test(h));
});

test("Img", async () => {
  const remail = create();
  const h = render(
    <Provider value={remail}>
      <Img src="/foo" alt="alt" style={{}} width="100" />
    </Provider>
  );
  assert.ok(/src="\/foo"/.test(h));
  assert.ok(/alt="alt"/.test(h));
});

test.run();
