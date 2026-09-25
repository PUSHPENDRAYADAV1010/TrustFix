import React from 'react';
import { Link } from 'react-router-dom';
import { CategoryIcon, sanitizeCategoryName, sanitizeCategoryDescription } from '../../utils/categoryIcons';
import { ArrowRight } from 'lucide-react';

export const CategoryCard = ({ category }) => {
  const cleanName = sanitizeCategoryName(category?.name || '');
  const cleanDesc = sanitizeCategoryDescription(category?.description || '', cleanName);
  const slug = category?.slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <Link
      to={`/services?category=${category?.id || slug}`}
      className="card card-hoverable"
      style={{
        padding: '1.75rem 1.5rem',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        backgroundColor: 'var(--white)',
        height: '100%',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--neutral-200)',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--primary-subtle)',
          color: 'var(--primary-800)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          border: '1px solid var(--primary-200)',
          boxShadow: 'var(--shadow-xs)',
          transition: 'transform var(--transition-fast)',
        }}
      >
        <CategoryIcon categoryName={cleanName} slug={slug} size={26} strokeWidth={2} />
      </div>

      <h4
        style={{
          fontSize: '1.15rem',
          fontWeight: 750,
          color: 'var(--neutral-900)',
          marginBottom: '0.5rem',
          lineHeight: 1.3
        }}
      >
        {cleanName}
      </h4>

      <p
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--neutral-600)',
          marginBottom: '1.5rem',
          lineHeight: 1.6,
          flex: 1,
        }}
        className="line-clamp-2"
      >
        {cleanDesc}
      </p>

      <span
        style={{
          fontSize: 'var(--font-size-sm)',
          fontWeight: 650,
          color: 'var(--primary-750)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: 'auto',
        }}
      >
        <span>Explore services</span>
        <ArrowRight size={15} strokeWidth={2.2} />
      </span>
    </Link>
  );
};
