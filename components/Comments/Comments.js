import React, { Component } from 'react';
import Subtitle from 'components/Subtitle';
import css from './Comments.css';

export default class Comments extends Component {
  componentDidMount() {
    if (window) {
      window.disqus_shortname = 'leandrooriente';
      window.disqus_url = `${window.location.origin}${window.location.pathname}`;

      (() => {
        const { document } = window;
        const script = document.createElement('script');
        script.src = 'https://leandrooriente.disqus.com/embed.js';
        script.setAttribute('data-timestamp', +new Date());
        script.async = true;
        (document.body || document.head).appendChild(script);
      })();
    }
  }

  render() {
    return (
      <div className={css.wrapper}>
        <Subtitle>Comments</Subtitle>
        <div id="disqus_thread" />
      </div>
    );
  }
}
