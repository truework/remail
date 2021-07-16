import tap from "tap";

import * as Lib from "../";

const { defaultTheme, getMobileCss, getMobileStyleTree, decomposeProps } = Lib;

tap.test("mobile values are extracted", async (t) => {
  const { className, style } = decomposeProps(
    {
      c: ["black", "blue"],
      p: [4, 2],
    },
    defaultTheme
  );
  const css = getMobileStyleTree();

  // @ts-ignore
  t.ok(style.color === defaultTheme.color.black);
  t.ok(style.paddingTop === "16px");
  t.ok(css[className][1].value === "8px");

  // values were reset
  t.ok(!Object.keys(getMobileStyleTree()).length);
});

tap.test("extracts CSS", async (t) => {
  const { className, style } = decomposeProps(
    {
      c: ["black", "blue"],
      p: [4, 2],
    },
    defaultTheme
  );

  const css = getMobileCss();

  t.ok(/color:blue/.test(css));
  t.ok(/padding-top:8px/.test(css));
});

tap.test("getMobileCss - width values are extracted", async (t) => {
  const { className, attr, style } = decomposeProps(
    {
      w: ["200px", "100%"],
    },
    defaultTheme
  );
  const css = getMobileStyleTree();

  t.ok(style.width === "200px");
  t.ok(attr.width === 200);
  t.ok(css[className][0].value === "100%");
});

tap.test("getMobileCss - mobile width int", async (t) => {
  const { className, attr, style } = decomposeProps(
    {
      w: ["200px", 100],
    },
    defaultTheme
  );
  const css = getMobileStyleTree();

  t.ok(css[className][0].value === "100px");
});

tap.test("getMobileCss - mobile width unitless string", async (t) => {
  const { className, attr, style } = decomposeProps(
    {
      w: ["200px", "100"],
    },
    defaultTheme
  );
  const css = getMobileStyleTree();

  t.ok(css[className][0].value === "100px");
});
