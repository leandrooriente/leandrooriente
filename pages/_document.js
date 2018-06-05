import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import 'normalize.css';

export default class MyDocument extends Document {
  render() {
    return (
      <html lang="en">
        <Head>
          <link rel="stylesheet" href="/_next/static/style.css" />
          <link rel="stylesheet" href="/static/normalize.css" />
          <link rel="stylesheet" href="/static/theme.css" />
          <link href="https://fonts.googleapis.com/css?family=Lora|Source+Sans+Pro:400,700" rel="stylesheet" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
