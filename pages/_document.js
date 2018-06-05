import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import 'normalize.css';

/* eslint-disable */
const GA = () => (
  <script dangerouslySetInnerHTML={{__html: `(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    ga('create', 'UA-25340215-1', 'auto');
    ga('send', 'pageview');`}}
  />
);
/* eslint-enable */

export default class MyDocument extends Document {
  render() {
    return (
      <html lang="en">
        <Head>
          <link rel="icon" type="image/png" href="/static/images/favicon.ico" />
          <link rel="stylesheet" href="/_next/static/style.css" />
          <link rel="stylesheet" href="/static/normalize.css" />
          <link rel="stylesheet" href="/static/theme.css" />
          <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css?family=Lora|Source+Sans+Pro:400,700" rel="stylesheet" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
        </Head>
        <body>
          <Main />
          <NextScript />
          <GA />
        </body>
      </html>
    );
  }
}
