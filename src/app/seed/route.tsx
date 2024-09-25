import { db } from '@vercel/postgres';

import { articles } from '../lib/placeholder-data';

const client = await db.connect();

async function seedArticles() {
  // Drop the existing table if it exists
  await client.sql`
    DROP TABLE IF EXISTS articles;
  `;

  await client.sql`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      article TEXT NOT NULL,
      url TEXT NOT NULL,
      publishedAt TIMESTAMP NOT NULL,
      urlToImage TEXT NOT NULL,
      title VARCHAR(255) NOT NULL,
      likes INTEGER NOT NULL
    );
  `;

  const insertedArticles = await Promise.all(
    articles.map(
      async ({ article, url, publishedAt, urlToImage, likes, title }) => {
        return client.sql`
        INSERT INTO articles (article, url, publishedAt, urlToImage, likes, title)
          VALUES ( ${article}, ${url}, ${new Date(
          publishedAt
        ).toISOString()}, ${urlToImage}, ${likes}, ${title})
        ON CONFLICT (id) DO NOTHING;
      `;
      }
    )
  );

  return insertedArticles;
}

export async function GET() {
  try {
    await client.sql`BEGIN`;
    await seedArticles();
    await client.sql`COMMIT`;

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    await client.sql`ROLLBACK`;
    return Response.json({ error }, { status: 500 });
  }
}
