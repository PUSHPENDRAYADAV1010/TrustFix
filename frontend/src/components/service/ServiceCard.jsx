import React from 'react';
import { Link } from 'react-router-dom';
import { RatingStars } from '../common/RatingStars';
import { formatCurrency } from '../../utils/formatters';
import { resolveServiceImage } from '../../utils/imageResolver';
import { CategoryIcon } from '../../utils/categoryIcons';
import { Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export const ServiceCard = ({ service }) => {
  const imageUrl = resolveServiceImage(service);

  return (
    <div
      className="card card-hoverable flex flex-col"
      style={{
        height: '100%',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--neutral-200)',
        overflow: 'hidden',
        backgroundColor: 'var(--white)'
      }}
    >
      {/* Service Header / Realistic Imagery */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden', backgroundColor: 'var(--neutral-100)' }}>
        <img
          src={imageUrl}
          alt={service.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
          loading="lazy"
        />
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(11, 30, 59, 0.90)',
            backdropFilter: 'blur(6px)',
            color: 'var(--white)',
            padding: '5px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 700,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}
        >
          <CategoryIcon categoryName={service.categoryName} size={14} strokeWidth={2.2} />
          <span>{service.categoryName}</span>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(5, 150, 105, 0.95)',
            backdropFilter: 'blur(4px)',
            color: 'var(--white)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
          }}
        >
          <ShieldCheck size={14} strokeWidth={2.5} />
          <span>Verified Quality</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body flex-1 flex flex-col justify-between" style={{ padding: '1.375rem' }}>
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <RatingStars rating={service.rating || 4.9} reviewCount={service.reviewCount || 34} size="sm" />
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--neutral-600)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Clock size={14} color="var(--neutral-400)" />
              <span>{service.durationMinutes || 60} mins</span>
            </span>
          </div>

          <h4
            style={{
              fontSize: '1.15rem',
              fontWeight: 750,
              marginBottom: '0.5rem',
              color: 'var(--neutral-900)',
              lineHeight: 1.35
            }}
          >
            {service.name}
          </h4>

          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--neutral-600)',
              lineHeight: 1.6,
              marginBottom: '1.25rem'
            }}
            className="line-clamp-2"
          >
            {service.shortDescription || service.description}
          </p>
        </div>

        {/* Price & CTA */}
        <div
          style={{
            borderTop: '1px solid var(--neutral-200)',
            paddingTop: '1rem',
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 700,
                color: 'var(--neutral-500)',
                display: 'block',
                lineHeight: 1.2
              }}
            >
              Starting from
            </span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-900)', lineHeight: 1.2 }}>
              {formatCurrency(service.startingPrice || service.basePrice || 299)}
            </span>
          </div>

          <Link to={`/services/detail/${service.id}`} className="btn btn-sm btn-primary" style={{ padding: '0.5rem 1rem', fontWeight: 650 }}>
            <span>View Details</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
