import React, { useRef, useMemo } from 'react';
import type { FormTemplate, FormContent, StampField } from '../types';
import { splitIntoParagraphs, seededVariation, FORM_HEADERS } from '../utils/textLayout';

interface FormCanvasProps {
  template: FormTemplate;
  content: FormContent;
  backgroundImage: string;
  stampField: StampField;
  onStampClick: (x: number, y: number) => void;
  showStampField?: boolean; // For debugging
  className?: string;
}

/**
 * FormCanvas component renders a form with background image and dynamic text
 * Uses absolute positioning to overlay text on form background
 */
export const FormCanvas: React.FC<FormCanvasProps> = ({
  template,
  content,
  backgroundImage,
  stampField,
  onStampClick,
  showStampField = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    onStampClick(x, y);
  };

  // Generate typography variations based on content
  const paragraphs = useMemo(() => splitIntoParagraphs(content.text), [content.text]);
  const variation = useMemo(
    () => seededVariation(content.title + content.text.slice(0, 16)),
    [content]
  );
  const header = useMemo(
    () => FORM_HEADERS[Math.floor(Math.abs(variation.rotateDeg * 10) % FORM_HEADERS.length)],
    [variation]
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full cursor-pointer select-none ${className}`}
      onClick={handleClick}
      style={{
        transform: `rotate(${template.rotation}deg)`,
      }}
    >
      {/* Background form image */}
      <img
        src={backgroundImage}
        alt="Form"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        draggable={false}
      />

      {/* Form Text Renderer - 1960s-80s Bureaucratic Style */}
      <section
        className="form-print-grain absolute left-1/2 -translate-x-1/2 px-6"
        style={{
          transform: `translateX(-50%) rotate(${variation.rotateDeg}deg)`,
          top: `${variation.topShiftPct}%`,
          maxWidth: `${variation.maxWidthPct}%`,
          lineHeight: variation.lineHeight.toString(),
          letterSpacing: `${variation.letterSpacing}px`,
          gap: `${variation.paragraphGap}px`,
        }}
        lang="de"
        aria-label="Formulartext"
      >
        {/* Department Header */}
        <p
          className="text-xs opacity-80 mb-1"
          style={{
            fontFamily: 'var(--form-mono)',
          }}
        >
          {header}
        </p>

        {/* Title */}
        <h2
          className="font-semibold mb-2"
          style={{
            fontFamily: 'var(--form-font)',
            fontSize: '1rem',
            letterSpacing: '0.02em',
          }}
        >
          {content.title.toUpperCase()}
        </h2>

        {/* Divider */}
        <div className="h-px w-full mb-3" style={{ background: 'rgba(0,0,0,.55)' }} />

        {/* Body Text */}
        <div
          className="form-text-justified flex flex-col"
          style={{
            fontFamily: 'var(--form-font)',
            fontSize: '0.95rem',
            gap: `${variation.paragraphGap}px`,
          }}
        >
          {paragraphs.map((p, i) => (
            <p key={i} className="mb-0">
              {p}
            </p>
          ))}
        </div>

        {/* Footer */}
        <div
          className="mt-3 text-xs opacity-70"
          style={{ fontFamily: 'var(--form-mono)' }}
        >
          AZ: — / Blatt: 1 / Kopie
        </div>
      </section>

      {/* Stamp field indicator - always show subtle version */}
      <div
        className="absolute rounded-full pointer-events-none transition-opacity duration-300"
        style={{
          left: `${(stampField.x - stampField.radius) * 100}%`,
          top: `${(stampField.y - stampField.radius) * 100}%`,
          width: `${stampField.radius * 2 * 100}%`,
          height: `${stampField.radius * 2 * 100}%`,
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(59, 130, 246, 0) 100%)',
          border: '2px dashed rgba(59, 130, 246, 0.3)',
          boxShadow: 'inset 0 0 20px rgba(59, 130, 246, 0.1)',
        }}
      />
      
      {/* Debug mode - show more prominent indicator */}
      {showStampField && (
        <div
          className="absolute rounded-full border-2 border-red-500 border-dashed pointer-events-none opacity-50"
          style={{
            left: `${(stampField.x - stampField.radius) * 100}%`,
            top: `${(stampField.y - stampField.radius) * 100}%`,
            width: `${stampField.radius * 2 * 100}%`,
            height: `${stampField.radius * 2 * 100}%`,
          }}
        />
      )}
    </div>
  );
};
