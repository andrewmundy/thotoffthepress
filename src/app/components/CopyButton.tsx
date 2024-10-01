'use client';
import React, { useState } from 'react';

export default function CopyButton({ article }: { article?: string }) {
  const [copied, setCoppied] = useState(false);
  if (!article) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(article ?? '');
    setCoppied(true);
    setTimeout(() => setCoppied(false), 2000);
  };
  return (
    <button className='copy-button' onClick={handleCopy}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
