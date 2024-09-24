'use client';
import React, { useEffect, useState } from 'react';
type ArticleType = {
  message: {
    article: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
  };
};
export default function Page() {
  const [article, setArticle] = useState<ArticleType>();
  const [loading, setLoading] = useState<boolean>(true);
  const articleDate = article?.message?.publishedAt
    ? new Date(article?.message?.publishedAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    : null;
  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch('/api/article');
        const data = await response.json();
        setArticle(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch articles', error);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);
  return (
    <div>
      {loading ? (
        <p className='loading'>Loading...</p>
      ) : (
        <div className='article'>
          {/* <Image
            className='article-image'
            src={article?.message?.urlToImage ?? ''}
            alt='Article Image'
            width={500}
            height={300}
          /> */}
          <p className='article-time'>{articleDate}</p>
          <p className='article-content'>{article?.message?.article}</p>
          <a className='article-url' href={article?.message?.url}>
            {article?.message?.url}
          </a>
        </div>
      )}
    </div>
  );
}
