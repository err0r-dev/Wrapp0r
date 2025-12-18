import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { ChartSlide as ChartSlideType } from '@wrapp0r/shared';

interface ChartSlideProps {
  slide: ChartSlideType;
}

// Simple animated bar chart component for Remotion
function AnimatedBarChart({ data }: { data: ChartSlideType['content']['data'] }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="flex h-64 items-end justify-center gap-4 md:h-80">
      {data.map((item, index) => {
        const delay = fps * 0.5 + index * (fps * 0.1);
        const progress = interpolate(
          frame,
          [delay, delay + fps * 0.5],
          [0, 1],
          { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
        );

        const heightPercent = (item.value / maxValue) * 100 * progress;

        return (
          <div key={index} className="flex flex-col items-center gap-2">
            <div
              className="w-12 rounded-t-lg md:w-16"
              style={{
                height: `${heightPercent}%`,
                backgroundColor: item.color || '#8b5cf6',
                minHeight: progress > 0 ? '4px' : '0px',
              }}
            />
            <span
              className="text-xs font-medium opacity-70 md:text-sm"
              style={{ opacity: progress * 0.7 }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Simple animated pie chart for Remotion
function AnimatedPieChart({ data, isDonut = false }: { data: ChartSlideType['content']['data']; isDonut?: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const progress = interpolate(
    frame,
    [fps * 0.5, fps * 1.5],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // Calculate pie segments
  let currentAngle = -90; // Start from top
  const segments = data.map((item, index) => {
    const percentage = item.value / total;
    const angle = percentage * 360 * progress;
    const startAngle = currentAngle;
    currentAngle += angle;

    return {
      ...item,
      startAngle,
      endAngle: currentAngle,
      color: item.color || `hsl(${(index * 360) / data.length}, 70%, 60%)`,
    };
  });

  const size = 200;
  const center = size / 2;
  const radius = size / 2 - 10;
  const innerRadius = isDonut ? radius * 0.6 : 0;

  // Convert angle to radians and calculate arc path
  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const innerStart = polarToCartesian(center, center, innerRadius, endAngle);
    const innerEnd = polarToCartesian(center, center, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    if (isDonut) {
      return [
        'M', start.x, start.y,
        'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        'L', innerEnd.x, innerEnd.y,
        'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
        'Z',
      ].join(' ');
    }

    return [
      'M', center, center,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'Z',
    ].join(' ');
  };

  return (
    <div className="flex items-center justify-center gap-8">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((segment, index) => {
          if (segment.endAngle - segment.startAngle < 0.5) return null;
          return (
            <path
              key={index}
              d={describeArc(segment.startAngle, segment.endAngle)}
              fill={segment.color}
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {data.map((item, index) => {
          const legendOpacity = interpolate(
            frame,
            [fps * 1 + index * (fps * 0.1), fps * 1.3 + index * (fps * 0.1)],
            [0, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          );

          return (
            <div
              key={index}
              className="flex items-center gap-2"
              style={{ opacity: legendOpacity }}
            >
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: item.color || `hsl(${(index * 360) / data.length}, 70%, 60%)` }}
              />
              <span className="text-sm">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simple animated line/area chart for Remotion
function AnimatedLineChart({ data, isArea = false }: { data: ChartSlideType['content']['data']; isArea?: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const maxValue = Math.max(...data.map((d) => d.value));
  const progress = interpolate(
    frame,
    [fps * 0.5, fps * 1.5],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const width = 400;
  const height = 200;
  const padding = 40;

  const points = data.map((item, index) => ({
    x: padding + (index / (data.length - 1)) * (width - padding * 2),
    y: height - padding - (item.value / maxValue) * (height - padding * 2),
  }));

  // Calculate the visible portion of the path based on progress
  const visiblePoints = points.slice(0, Math.ceil(points.length * progress));

  const linePath = visiblePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaPath = linePath + ` L ${visiblePoints[visiblePoints.length - 1]?.x || padding} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <line
          key={ratio}
          x1={padding}
          y1={height - padding - ratio * (height - padding * 2)}
          x2={width - padding}
          y2={height - padding - ratio * (height - padding * 2)}
          stroke="currentColor"
          strokeOpacity={0.1}
        />
      ))}

      {/* Area fill */}
      {isArea && visiblePoints.length > 1 && (
        <path d={areaPath} fill="currentColor" fillOpacity={0.2} />
      )}

      {/* Line */}
      {visiblePoints.length > 1 && (
        <path d={linePath} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      )}

      {/* Points */}
      {visiblePoints.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r={4} fill="currentColor" />
      ))}

      {/* Labels */}
      {data.map((item, index) => {
        const labelOpacity = interpolate(
          frame,
          [fps * 1.5 + index * (fps * 0.05), fps * 1.8 + index * (fps * 0.05)],
          [0, 0.7],
          { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
        );

        return (
          <text
            key={index}
            x={padding + (index / (data.length - 1)) * (width - padding * 2)}
            y={height - 10}
            textAnchor="middle"
            fontSize={12}
            fill="currentColor"
            opacity={labelOpacity}
          >
            {item.label}
          </text>
        );
      })}
    </svg>
  );
}

// Helper function
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export function ChartSlide({ slide }: ChartSlideProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { title, chartType, data } = slide.content;

  // Title animation
  const titleOpacity = interpolate(
    frame,
    [0, fps * 0.3],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );
  const titleY = interpolate(
    frame,
    [0, fps * 0.3],
    [-20, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <AnimatedBarChart data={data} />;
      case 'pie':
        return <AnimatedPieChart data={data} />;
      case 'donut':
        return <AnimatedPieChart data={data} isDonut />;
      case 'line':
        return <AnimatedLineChart data={data} />;
      case 'area':
        return <AnimatedLineChart data={data} isArea />;
      default:
        return <AnimatedBarChart data={data} />;
    }
  };

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-8">
      <h2
        className="mb-8 text-3xl font-bold md:text-4xl"
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        {title}
      </h2>

      <div className="w-full max-w-2xl">{renderChart()}</div>
    </AbsoluteFill>
  );
}
