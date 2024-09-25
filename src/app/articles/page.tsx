import { sql } from '@vercel/postgres';
import React from 'react';

const Articles: React.FC = async () => {
  const { rows } = await sql`SELECT * FROM articles`;

  return (
    <div>
      {rows.map(({ title, article, id }) => (
        <div key={id}>
          {title}
          {article}
        </div>
      ))}
    </div>
  );
};

export default Articles;
