import { sql } from '@vercel/postgres';
import Link from 'next/link';
import React from 'react';

import { ArticleType } from './[article]/page';

async function fetchArticles(): Promise<ArticleType[]> {
  const { rows } = await sql`SELECT * FROM articles`;

  return rows.reverse().map((row) => ({
    id: row.id,
    title: row.title,
    article: row.article,
    url: row.url,
    urlToImage: row.urltoimage ?? '',
    publishedAt: row.publishedat,
    likes: row.likes,
  }));
}

const Page = async () => {
  const articles = await fetchArticles();
  return (
    <div>
      <div className='articles'>
        <div className='articles-heading'>
          <h1 className='articles-heading-title'>💦 Thot off the press 🥵</h1>
          <span className='articles-heading-subtitle'>
            breaking news, but really really dumb
          </span>
        </div>
        {articles.map(({ id, title, publishedAt }, i) => {
          const published = new Date(publishedAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          });
          return (
            <Link className='articles-box' key={i} href={`/articles/${id}`}>
              <span className='articles-box--time'>{published}</span>
              <div className='articles-box--article'>{title}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Page;
