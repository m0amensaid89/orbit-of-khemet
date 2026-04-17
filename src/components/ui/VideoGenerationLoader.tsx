"use client";

import React, { useState, useEffect } from "react";

const statuses = [
  "Awakening the vision...",
  "Channeling ancient power...",
  "Rendering your creation...",
  "Almost there..."
];

export const VideoGenerationLoader = () => {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      gap: '24px'
    }}>
      {/* Eye of Ra SVG Container */}
      <div style={{
        position: 'relative',
        width: '80px',
        height: '80px',
      }}>
        {/* Outer Glow */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          boxShadow: '0 0 30px rgba(212, 175, 55, 0.2)',
          animation: 'pulseGlow 2s infinite ease-in-out'
        }} />

        {/* SVG */}
        <svg
          viewBox="0 0 100 100"
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            zIndex: 1,
            filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.4))'
          }}
        >
          {/* Main Eye Outline */}
          <path
            d="M 10 50 Q 50 10 90 50 Q 50 80 10 50 Z"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="3"
            style={{ opacity: 0.8 }}
          />
          {/* Eye Arch/Eyebrow */}
          <path
            d="M 15 35 Q 50 5 95 40"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="4"
          />
          {/* Under Eye Markings */}
          <path
            d="M 50 80 Q 50 95 65 95"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="3"
          />
          <path
            d="M 40 70 Q 30 90 10 85"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="3"
          />

          {/* Pupil Base */}
          <circle cx="50" cy="50" r="15" fill="#0A0A0A" stroke="#D4AF37" strokeWidth="2" />

          {/* Pulsing Pupil Center */}
          <circle cx="50" cy="50" r="8" style={{ animation: 'pupilPulse 3s infinite alternate' }} />
        </svg>
      </div>

      {/* Progress Bar Container */}
      <div style={{
        width: '100%',
        maxWidth: '240px',
        height: '4px',
        background: '#1a1a1a',
        borderRadius: '2px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Shimmer Track */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '50%',
          background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
          animation: 'shimmer 2s infinite linear'
        }} />
      </div>

      {/* Status Text */}
      <div style={{
        fontFamily: 'Orbitron, sans-serif',
        color: '#d0c5af',
        fontSize: '11px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        textAlign: 'center',
        height: '20px',
        transition: 'opacity 0.5s ease-in-out',
      }}>
        {statuses[statusIndex]}
      </div>

      {/* Global styles for this component */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.2); }
          50% { box-shadow: 0 0 40px rgba(212, 175, 55, 0.5); }
        }
        @keyframes pupilPulse {
          0% { fill: #2563EB; r: 6; }
          100% { fill: #06B6D4; r: 10; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}} />
    </div>
  );
};
