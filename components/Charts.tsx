'use client';

import { useEffect, useRef } from 'react';

type LineChartProps = {
  data: { month: string; ingresos: number; gastos: number }[];
  height?: number;
};

export function LineChart({ data, height = 300 }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up dimensions
    const padding = 60;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;

    // Find max value for scaling
    const maxValue = Math.max(
      ...data.flatMap(d => [d.ingresos, d.gastos]),
      0
    );

    // Set up grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let i = 0; i <= data.length; i++) {
      const x = padding + (i * width) / data.length;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();
    }

    // Horizontal grid lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (i * height) / gridLines;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Draw lines
    const drawLine = (values: number[], color: string) => {
      if (values.length === 0) return;

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();

      values.forEach((value, index) => {
        const x = padding + ((index + 0.5) * width) / data.length;
        const y = canvas.height - padding - (value / maxValue) * height;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw points
      ctx.fillStyle = color;
      values.forEach((value, index) => {
        const x = padding + ((index + 0.5) * width) / data.length;
        const y = canvas.height - padding - (value / maxValue) * height;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    };

    // Draw income line (green)
    drawLine(data.map(d => d.ingresos), '#10B981');
    
    // Draw expenses line (red)
    drawLine(data.map(d => d.gastos), '#EF4444');

    // Draw labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';

    // X-axis labels (months)
    data.forEach((item, index) => {
      const x = padding + ((index + 0.5) * width) / data.length;
      const y = canvas.height - padding + 20;
      ctx.fillText(item.month, x, y);
    });

    // Y-axis labels (values)
    for (let i = 0; i <= gridLines; i++) {
      const value = (maxValue / gridLines) * (gridLines - i);
      const y = padding + (i * height) / gridLines + 4;
      ctx.textAlign = 'right';
      ctx.fillText(`€${(value / 1000).toFixed(0)}k`, padding - 10, y);
    }

  }, [data, height]);

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef}
        width={800}
        height={height}
        className="w-full h-auto bg-transparent"
      />
      <div className="absolute top-4 right-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-wos-text-muted">Ingresos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-wos-text-muted">Gastos</span>
        </div>
      </div>
    </div>
  );
}

type DonutChartProps = {
  data: { label: string; value: number; color: string }[];
  height?: number;
};

export function DonutChart({ data, height = 300 }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = Math.min(centerX, centerY) - 20;
    const innerRadius = outerRadius * 0.5;

    // Calculate total
    const total = data.reduce((sum, item) => sum + item.value, 0);

    let currentAngle = -Math.PI / 2; // Start from top

    // Draw segments
    data.forEach(segment => {
      const sliceAngle = (segment.value / total) * 2 * Math.PI;

      // Draw outer arc
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // Draw center text
    ctx.fillStyle = '#E5E7EB';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Total', centerX, centerY - 5);
    ctx.font = '14px system-ui';
    ctx.fillText(`€${(total / 1000).toFixed(0)}k`, centerX, centerY + 15);

  }, [data, height]);

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef}
        width={height}
        height={height}
        className="w-full h-auto bg-transparent"
      />
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-wos-text-muted">{item.label}</span>
            </div>
            <span className="font-medium text-wos-text">
              €{item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}