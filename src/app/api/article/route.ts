import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });
const instructions = process.env.GPT_PROMPT || '';
// To handle a GET request to /api
export async function GET() {
  try {
    const newsArticles = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`
    ).then((res) => res.json());
    const article = {
      title: newsArticles.articles[0].title,
      description: newsArticles.articles[0].description,
      url: newsArticles.articles[0].url,
      urlToImage: newsArticles.articles[0].urlToImage,
      publishedAt: newsArticles.articles[0].publishedAt,
      content: newsArticles.articles[0].content,
    };
    const sentence = `${article.title}. ${article.description}. ${
      article.content.split('...')[0]
    }`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: instructions },
        {
          role: 'user',
          content: sentence,
        },
      ],
    });
    const final = {
      article: completion.choices[0].message.content,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
    };
    return NextResponse.json({ message: final }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch articles or generate completion' },
      { status: 500 }
    );
  }
}
// To handle a POST request to /api
export async function POST() {
  // Do whatever you want
  return NextResponse.json({ message: 'Hello World' }, { status: 200 });
}
// Same logic to add a `PATCH`, `DELETE`...
