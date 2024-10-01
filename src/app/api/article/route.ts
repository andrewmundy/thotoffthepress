import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = await db.connect();
const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });
const articlePrompt = process.env.GPT_PROMPT || '';
const titlePrompt = `${
  process.env.GPT_TITLE_PROMPT || ''
}. Please keep this title short, max 100 chars.`;
const ARTICLE_FETCH_ERROR = '[Removed]';

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

    const gptArticleContent = await openai.chat.completions.create({
      model: 'chatgpt-4o-latest',
      messages: [
        { role: 'system', content: articlePrompt },
        {
          role: 'user',
          content: newsArticle.content,
        },
      ],
    });

    const gptArticleTitle = await openai.chat.completions.create({
      model: 'chatgpt-4o-latest',
      messages: [
        { role: 'system', content: titlePrompt },
        {
          role: 'user',
          content: newsArticle.title,
        },
      ],
    });

    const final = {
      title: gptArticleTitle.choices[0].message.content,
      article: gptArticleContent.choices[0].message.content,
      url: newsArticle.url,
      urlToImage: newsArticle.urlToImage,
      publishedAt: newsArticle.publishedAt,
      likes: 0,
    };

    const { title, article, url, publishedAt, urlToImage, likes } = final;

    // Check if an article with the same publishedAt already exists
    const { rows: existingArticles } = await client.sql`
        SELECT * FROM articles WHERE publishedAt = ${new Date(
          publishedAt
        ).toISOString()};
      `;

    const { rows: lastArticle } = await client.sql`
      SELECT * FROM articles
      ORDER BY id DESC
      LIMIT 1;
    `;

    if (existingArticles.length === 0 && final.url !== 'https://removed.com') {
      await client.sql`
              INSERT INTO articles (article, url, publishedAt, urlToImage, likes, title)
              VALUES (${article}, ${url}, ${new Date(
        publishedAt
      ).toISOString()}, ${urlToImage ?? ''}, ${likes}, ${title})
              ON CONFLICT (id) DO NOTHING;
            `;
      return NextResponse.json({ message: final }, { status: 200 });
    } else {
      const lastArticleOrFallback =
        existingArticles.length > 1 ? existingArticles[0] : lastArticle[0];
      return NextResponse.json(
        { message: lastArticleOrFallback },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { id, article, url, publishedAt, urlToImage, likes, title } =
      await request.json();

    await client.sql`
      INSERT INTO articles (id, article, url, publishedAt, urlToImage, likes, title)
      VALUES (${id}, ${article}, ${url}, ${new Date(
      publishedAt
    ).toISOString()}, ${urlToImage}, ${likes}, ${title})
    `;

    return NextResponse.json(
      { message: 'Article added successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add article', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    // Delete the article with the specified id
    await client.sql`
      DELETE FROM articles WHERE id = ${id};
    `;

    return NextResponse.json(
      { message: 'Article deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
