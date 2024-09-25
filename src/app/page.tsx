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
  const [showToast, setShowToast] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Update the theme based on local storage and system preference
      const storedTheme = window.localStorage.getItem('theme');
      const prefersDarkMode =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (storedTheme === 'dark' || (!storedTheme && prefersDarkMode)) {
        setIsDarkMode(true);
      }
    }
  }, []);

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

  const handleCopy = () => {
    navigator.clipboard.writeText(article?.message?.article ?? '');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); // Hide toast after 3 seconds
  };

  // const toggleTheme = () => {
  //   const newTheme = !isDarkMode;
  //   setIsDarkMode(newTheme);
  // };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('theme', 'dark');
      }
    } else {
      document.body.classList.remove('dark');
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('theme', 'light');
      }
    }
  }, [isDarkMode]);

  return (
    <div>
      {loading ? (
        <p className='loading'>
          Loading<span className='dot1'>.</span>
          <span className='dot2'>.</span>
          <span className='dot3'>.</span>
        </p>
      ) : (
        <div className='article'>
          <p className='article-content'>{article?.message?.article}</p>
          <p className='article-time'>{articleDate}</p>
          <div className='article-footer'>
            <a className='article-url' href={article?.message?.url}>
              View article
            </a>
            <div className='article-footer-group'>
              <button className='copy-button' onClick={handleCopy}>
                Copy
              </button>
              {/* <button
                className='theme-toggle-button copy-button'
                onClick={toggleTheme}
              >
                {isDarkMode ? '🌞' : '🌜'}
              </button> */}
            </div>
          </div>
        </div>
      )}
      {showToast && <div className='toast'>Copied to clipboard</div>}
    </div>
  );
}
