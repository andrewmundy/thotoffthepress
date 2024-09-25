import { sql } from '@vercel/postgres';
import React from 'react';

interface Article {
  id: number;
  title: string;
  article: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  likes: number;
}

async function fetchArticles(): Promise<Article[]> {
  const { rows } = await sql`SELECT * FROM articles`;
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    article: row.article,
    url: row.url,
    urlToImage: row.urlToImage ?? '',
    publishedAt: row.publishedat,
    likes: row.likes,
  }));
}

const Articles: React.FC<{ articles: Article[] }> = ({ articles }) => {
  return (
    <div>
      {articles.map(({ title, article, id }) => (
        <div key={id}>
          <h2>{title}</h2>
          <p>{article}</p>
        </div>
      ))}
    </div>
  );
};

const Page = async () => {
  const articles = await fetchArticles();
  return <Articles articles={articles} />;
};

export default Page;
