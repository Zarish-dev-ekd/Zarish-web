'use client';

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeSvgProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  className?: string;
}

export default function BarcodeSvg({
  value,
  width = 2,
  height = 50,
  displayValue = false,
  className = '',
}: BarcodeSvgProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value.trim(), {
          format: 'CODE128',
          width,
          height,
          displayValue,
          margin: 2,
          background: 'transparent',
          lineColor: '#000000',
          valid: (valid) => {
            if (!valid) {
              console.warn('[Barcode] Invalid value for Code128:', value);
            }
          },
        });
      } catch (err) {
        console.warn('[Barcode] Render error:', err);
      }
    }
  }, [value, width, height, displayValue]);

  return <svg ref={svgRef} className={className} />;
}
