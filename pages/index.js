import React from 'react';
import Main from 'components/Main';
import Section from 'components/Section';
import Headline from 'components/Headline';
import Experiences from 'components/Experiences';
import GetInTouch from 'components/GetInTouch';

import experiences from 'data/experiences';

export default () => (
  <Main>
    <Headline />

    <Section>
      <Experiences experiences={experiences} />
    </Section>

    <Section>
      <GetInTouch />
    </Section>
  </Main>
);
