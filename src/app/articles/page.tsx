import Link from 'next/link';
import React from 'react';

import { ArticleType } from './[article]/page';

export type ApiArticleType = {
  id: string;
  title: string;
  article: string;
  url: string;
  urltoimage: string;
  publishedat: string;
  likes: number;
};

const baseUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.VERCEL_DOMAIN;

async function fetchArticles() {
  try {
    const articles = await fetch(`${baseUrl}/api/articles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await articles.json();
    const formattedData = data?.message.map((row: ApiArticleType) => ({
      id: row.id,
      title: row.title,
      article: row.article,
      url: row.url,
      urlToImage: row.urltoimage ?? '',
      publishedAt: row.publishedat,
      likes: row.likes,
    }));
    return formattedData;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch articles', error);
  }
}

const Page = async () => {
  let articles: ArticleType[] = [];
  try {
    articles = await fetchArticles();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch articles:', error);
  }

  const renderArticles = articles?.map(({ id, title, publishedAt }, i) => {
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
  });

  return (
    <div>
      <div className='articles'>
        <div className='articles-heading'>
          <h1 className='articles-heading-title'>💦 Thot off the press 🥵</h1>
          <span className='articles-heading-subtitle'>
            breaking news, but really really dumb
          </span>
        </div>
        {renderArticles}
      </div>
    </div>
  );
};

export default Page;
