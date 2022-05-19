import fs from "fs";
import path from "path";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  createDocument,
  createRemail,
  presets,
  Provider,
  Box,
  Type,
  Img,
  Columns,
  Column,
  Button,
} from "remail";

const theme = {
  ...presets,
  tokens: {
    ...presets.tokens,
    color: {
      light: "#F7F7FF",
      dark: "#383758",
      red: "#D93025",
      yellow: "#F9C22E",
      blue: "#449DD1",
    },
    fontFamily: {
      sans: "'Inter', sans-serif",
      mono: "monospace",
    },
  },
};

const remail = createRemail({ theme });

function Section(props: React.PropsWithChildren<{}>) {
  return (
    <Box
      w={1}
      bg="white"
      style={{
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0px 2px 6px rgba(56, 55, 88, 0.1)",
      }}
    >
      {props.children}
    </Box>
  );
}

function Padding(props: React.PropsWithChildren<{}>) {
  return <Box p={[8, 6]}>{props.children}</Box>;
}

function CheckmarkRow(props: React.PropsWithChildren<{}>) {
  return (
    <Columns pt={2}>
      <Column va="middle">
        <Img
          src="https://unpkg.com/feather-icons@4.29.0/dist/icons/check.svg"
          w={16}
        />
      </Column>
      <Column va="middle" pl={4}>
        <Type fs={5} lh={5}>
          {props.children}
        </Type>
      </Column>
    </Columns>
  );
}

function Email() {
  return (
    <Box bg="light" c="dark" py="64px" px={[12, 4]}>
      <Box a="center" w={["600", "100%"]}>
        <Box py={10} a="center">
          <Img
            mx={[0, "auto"]}
            href="https://github.com/truework/remail"
            src="/remail-logo.svg"
            w={150}
          />
        </Box>

        <Section>
          <Img src="/header.jpg" w={1} />
          <Padding>
            <Type fs={2} a="center">
              <strong>HTML Email in React</strong>
            </Type>
            <Type fs={5} pt={6} a="center">
              Build custom HTML emails using React, TypeScript, and CSS-in-JS.
            </Type>
            <Box pt={8}>
              <Button
                a="center"
                href="https://github.com/truework/remail"
                py={4}
                px={6}
                bg="blue"
                c="light"
                fw={9}
                style={{ borderRadius: "4px" }}
              >
                Get Started
              </Button>
            </Box>
          </Padding>
        </Section>

        <Box pt={8}>
          <Section>
            <Padding>
              <Type fs={3}>
                <strong>Featuring</strong>
              </Type>

              <Box pt={4}>
                <CheckmarkRow>CSS-in-JS theming</CheckmarkRow>
                <CheckmarkRow>
                  Configurable shorthands for common CSS properties
                </CheckmarkRow>
                <CheckmarkRow>
                  Mobile styling for clients that support it
                </CheckmarkRow>
                <CheckmarkRow>
                  Convenient shorthands for whitespace e.g.{" "}
                  <code>pt='12px'</code>
                </CheckmarkRow>
                <CheckmarkRow>
                  Generic <code>&lt;Box/&gt;</code> component for flexible
                  styling
                </CheckmarkRow>
                <CheckmarkRow>
                  Consistent type styling via <code>&lt;Type/&gt;</code>
                </CheckmarkRow>
                <CheckmarkRow>
                  Cross-client linkable images with <code>&lt;Img/&gt;</code>
                </CheckmarkRow>
                <CheckmarkRow>
                  <Type a="right">
                    Convenient alignment shorthands for text & images
                  </Type>
                </CheckmarkRow>
                <CheckmarkRow>
                  Easy columns with{" "}
                  <code>&lt;Columns&gt;&lt;Column/&gt;&lt;/Columns&gt;</code>
                </CheckmarkRow>
                <CheckmarkRow>
                  Bulletproof <code>&lt;Button/&gt;</code> like above
                </CheckmarkRow>
                <CheckmarkRow>
                  Utils to create the HTML document, and more
                </CheckmarkRow>
              </Box>
            </Padding>
          </Section>
        </Box>

        <Columns a="center" py={10}>
          <Column va="middle" px={4}>
            <Img
              href="https://twitter.com/truework"
              src="https://unpkg.com/feather-icons@4.29.0/dist/icons/twitter.svg"
              w={24}
            />
          </Column>
          <Column va="middle" px={4}>
            <Img
              href="https://github.com/truework/remail"
              src="https://unpkg.com/feather-icons@4.29.0/dist/icons/github.svg"
              w={24}
            />
          </Column>
        </Columns>
      </Box>
    </Box>
  );
}

const body = renderToStaticMarkup(
  <Provider value={remail}>
    <Email />
  </Provider>
);

const styles = `
  html, body {
    font-family: ${theme.tokens.fontFamily.sans};
    font-weight: 400;
    -moz-osx-font-smoothing: grayscale;
  }
  a[href] {
    color: ${theme.tokens.color.blue} !important;
  }
  strong {
    font-weight: 900;
  }
  code {
    background: ${theme.tokens.color.dark};
    color: ${theme.tokens.color.light};
    font-family: ${theme.tokens.fontFamily.mono};
    padding: 0 2px;
  }
`;

const css = remail.flushMobileCss();

const document = createDocument({
  title: "My Email",
  head: `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;900&display=swap" rel="stylesheet"> 
  `,
  css: styles + css,
  body,
});

fs.writeFile(path.join(__dirname, "public/index.html"), document, (err) => {
  console.log("\n  Built public/index.html\n");
});
