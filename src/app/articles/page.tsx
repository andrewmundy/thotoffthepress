import React from 'react';

import RenderArticles from './renderArticles';

export const dynamic = 'force-dynamic';

const Page = async () => {
  return (
    <div>
      <div className='articles'>
        <div className='articles-heading'>
          <h1 className='articles-heading-title'>💦 Thot off the press 🥵</h1>
          <span className='articles-heading-subtitle'>
            breaking news, but really really dumb
          </span>
        </div>
        <RenderArticles />
      </div>
    </div>
  );
};

export default Page;
