import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const client = await db.connect();
const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });
const articlePrompt = process.env.GPT_PROMPT || '';
const titlePrompt = `${
  process.env.GPT_TITLE_PROMPT || ''
}. Please keep this title short, max 100 chars.`;
const ARTICLE_FETCH_ERROR = '[Removed]';

async function getGptData(prompt: string, content: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'chatgpt-4o-latest',
      messages: [
        { role: 'system', content: prompt },
        {
          role: 'user',
          content: content,
        },
      ],
    });
    return response.choices[0].message.content;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating GPT article content:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const newsArticles = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`
    ).then((res) => res.json());

    if (newsArticles.articles[0].title === ARTICLE_FETCH_ERROR) {
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      );
    }
    const newsArticle = {
      title: newsArticles.articles[0].title,
      description: newsArticles.articles[0].description,
      url: newsArticles.articles[0].url,
      urlToImage: newsArticles.articles[0].urlToImage,
      publishedAt: newsArticles.articles[0].publishedAt,
      content:
        newsArticles.articles[0].description || newsArticles.articles[0].title,
    };

    const gptArticleContent = await getGptData(
      articlePrompt,
      newsArticle.content
    );
    const gptArticleTitle = await getGptData(titlePrompt, newsArticle.title);

    const final = {
      title: gptArticleTitle,
      article: gptArticleContent,
      url: newsArticle.url,
      urlToImage: newsArticle.urlToImage,
      publishedAt: newsArticle.publishedAt,
      likes: 0,
    };

    const { title, article, url, publishedAt, urlToImage, likes } = final || {};

    // Check if an article with the same publishedAt already exists
    const { rows: existingArticles } = await client.sql`
      SELECT * FROM articles WHERE publishedAt = ${new Date(
        publishedAt
      ).toISOString()};
    `;

    const { rows: allArticles } = await client.sql`
      SELECT * FROM articles
      ORDER BY id DESC
    `;

    if (existingArticles.length === 0 && final.url !== 'https://removed.com') {
      await client.sql`
              INSERT INTO articles (article, url, publishedAt, urlToImage, likes, title)
              VALUES (${article}, ${url}, ${new Date(
        publishedAt
      ).toISOString()}, ${urlToImage ?? ''}, ${likes}, ${title})
              ON CONFLICT (id) DO NOTHING;
            `;
      return NextResponse.json({ message: allArticles }, { status: 200 });
    } else {
      return NextResponse.json({ message: allArticles }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
