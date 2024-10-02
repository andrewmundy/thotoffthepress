'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { ArticleType } from './[article]/page';
import Loader from '../../components/Loader';

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

export function convertToTimestamp(time: string | number | Date) {
  return new Date(time).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export default function RenderArticles() {
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchArticles = () => {
    return fetch(`${baseUrl}/api/articles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        return response.json();
      })
      .then((data) => {
        const formattedData = data?.message.map(
          (row: ApiArticleType): ArticleType => ({
            id: row.id,
            title: row.title,
            article: row.article,
            url: row.url,
            urlToImage: row.urltoimage ?? '',
            publishedAt: row.publishedat,
            likes: row.likes,
          })
        );
        return formattedData;
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch articles', error);
        throw error;
      });
  };

  useEffect(() => {
    setLoading(true);
    fetchArticles()
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {articles?.map(({ id, publishedAt, title }, i) => {
        return (
          <Link className='articles-box' key={i} href={`/articles/${id}`}>
            <span className='articles-box--time'>
              {convertToTimestamp(publishedAt)}
            </span>
            <div className='articles-box--article'>{title}</div>
          </Link>
        );
      })}
    </div>
  );
}
