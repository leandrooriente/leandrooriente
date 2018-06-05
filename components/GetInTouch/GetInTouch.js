import React from 'react';
import { social } from 'constants';
import Subtitle from 'components/Subtitle';
import Button from 'components/Button';
import css from './GetInTouch.css';

const GetInTouch = () => (
  <div className={css.container} id="get-in-touch">
    <Subtitle>Get in touch</Subtitle>
    <div className={css.links}>
      {social.map(link => (
        <Button
          className={css.link}
          href={link.url}
          key={link.description}
        >
          {link.name}
        </Button>
      ))}
    </div>
  </div>
);

export default GetInTouch;
