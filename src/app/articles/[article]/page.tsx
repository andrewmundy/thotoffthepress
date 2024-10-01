import { sql } from '@vercel/postgres';
import Link from 'next/link';
import React from 'react';

import CopyButton from '../../components/CopyButton';

// Define the type for the article
export interface ArticleType {
  id: number;
  title: string;
  article: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  likes: number;
}

// Fetch article data
async function fetchArticle(id: string): Promise<ArticleType | undefined> {
  const { rows } = await sql`SELECT * FROM articles WHERE id = ${id}`;
  if (rows.length > 0) {
    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      article: row.article,
      url: row.url,
      urlToImage: row.urlToImage,
      publishedAt: row.publishedat,
      likes: row.likes,
    };
  }
  return undefined;
}

// Define the Article component
const Article = async ({ params }: { params: { article: string } }) => {
  const fetchedArticle = await fetchArticle(params.article ?? '');
  const publishedAt = new Date(
    fetchedArticle?.publishedAt ?? ''
  ).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className='article'>
      <span className='back-button'>
        <Link href='/articles'>back</Link>
      </span>
      <div className='article-header'>
        <h2 className='article-header-title'>{fetchedArticle?.title}</h2>
        <span className='article-header-subtitle'>{publishedAt}</span>
      </div>
      <p className='article-content'>{fetchedArticle?.article}</p>
      <div className='article-footer'>
        <Link href={fetchedArticle?.url ?? ''}>Read more 🔗</Link>
        <CopyButton article={fetchedArticle?.article} />
      </div>
    </div>
  );
};

export default Article;
