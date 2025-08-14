'use client';

import { useState, useEffect } from 'react';
import TitleIssuingGrid from './TitleIssuingGrid';
import MotionWrapper from './MotionWrapper';

const TitleIssuingFilters = ({ initialEvents, statusOptions }) => {
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(false);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <MotionWrapper 
        effect="slideIn" 
        direction="right" 
        delay={0.4} 
        duration={0.8}
      >
        <h1 className="text-4xl font-bold text-primary mb-6">
          <span className="text-secondary flex flex-col items-center">
            Title Issuing Events
            <MotionWrapper 
              effect="slideIn" 
              direction="up" 
              delay={0.4} 
              duration={0.8}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-rotate-[10deg] -mt-2.5 -ml-8" viewBox="0 0 200 30" width="150" height="30">
                <path d="M10 25 Q140 2 190 25" 
                  stroke="rgb(220 38 38)" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  fill="none"/>
              </svg>
            </MotionWrapper>
          </span>
        </h1>
        <p className="text-base text-white/90 text-center text-secondary/70 font-semibold mb-8 max-w-2xl mx-auto">
          Track our  title issuing events for various projects and clients
        </p>
      </MotionWrapper>
      {/* Events Grid */}
      <TitleIssuingGrid events={events} loading={loading} />
    </main>
  );
};

export default TitleIssuingFilters;