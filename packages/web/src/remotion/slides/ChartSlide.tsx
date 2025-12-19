import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ChartSlide as ChartSlideType } from '@wrapp0r/shared';
import { useAnimatedChartData, useEasedProgress, EASING } from '../animations';

interface ChartSlideProps {
  slide: ChartSlideType;
}

const DEFAULT_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#0088FE',
];

export function ChartSlide({ slide }: ChartSlideProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { title, chartType, data, showLegend } = slide.content;

  // Title animation
  const titleProgress = useEasedProgress({ delay: 0, duration: 0.4, easing: 'easeOut' });

  // Prepare data with colors
  const baseChartData = data.map((item, index) => ({
    ...item,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  // Animate chart data values
  const animatedData = useAnimatedChartData(baseChartData, {
    delay: 0.3,
    duration: 1.0,
    stagger: 0.08,
    easing: 'easeOut',
  });

  // For pie charts, we animate differently - using a sweep angle
  const pieProgress = useEasedProgress({ delay: 0.3, duration: 1.2, easing: 'easeOut' });

  // Legend fade in
  const legendOpacity = useEasedProgress({ delay: 1.0, duration: 0.4, easing: 'easeOut' });

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={animatedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                interval={0}
                height={80}
                axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                tickLine={{ stroke: 'currentColor', opacity: 0.2 }}
              />
              <YAxis
                tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 12 }}
                axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                tickLine={{ stroke: 'currentColor', opacity: 0.2 }}
              />
              {showLegend && <Legend wrapperStyle={{ opacity: legendOpacity }} />}
              <Bar dataKey="value" isAnimationActive={false} radius={[4, 4, 0, 0]}>
                {animatedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={animatedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                interval={0}
                height={80}
                axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                tickLine={{ stroke: 'currentColor', opacity: 0.2 }}
              />
              <YAxis
                tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 12 }}
                axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                tickLine={{ stroke: 'currentColor', opacity: 0.2 }}
              />
              {showLegend && <Legend wrapperStyle={{ opacity: legendOpacity }} />}
              <Line
                type="monotone"
                dataKey="value"
                stroke={baseChartData[0]?.color || DEFAULT_COLORS[0]}
                strokeWidth={3}
                dot={{ fill: baseChartData[0]?.color || DEFAULT_COLORS[0], r: 5 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={animatedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                interval={0}
                height={80}
                axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                tickLine={{ stroke: 'currentColor', opacity: 0.2 }}
              />
              <YAxis
                tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 12 }}
                axisLine={{ stroke: 'currentColor', opacity: 0.2 }}
                tickLine={{ stroke: 'currentColor', opacity: 0.2 }}
              />
              {showLegend && <Legend wrapperStyle={{ opacity: legendOpacity }} />}
              <Area
                type="monotone"
                dataKey="value"
                stroke={baseChartData[0]?.color || DEFAULT_COLORS[0]}
                fill={baseChartData[0]?.color || DEFAULT_COLORS[0]}
                fillOpacity={0.3}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut':
        // For pie charts, we scale the data values by pieProgress
        const pieData = baseChartData.map((item) => ({
          ...item,
          value: item.value * pieProgress,
        }));

        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={chartType === 'donut' ? '50%' : 0}
                outerRadius="80%"
                paddingAngle={2}
                dataKey="value"
                nameKey="label"
                isAnimationActive={false}
                label={pieProgress > 0.9 ? ({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                : undefined}
                labelLine={pieProgress > 0.9 ? { stroke: 'currentColor', opacity: 0.5 } : false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {showLegend && <Legend wrapperStyle={{ opacity: legendOpacity }} />}
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={animatedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <XAxis dataKey="label" tick={{ fill: 'currentColor', opacity: 0.7 }} />
              <YAxis tick={{ fill: 'currentColor', opacity: 0.7 }} />
              <Bar dataKey="value" isAnimationActive={false}>
                {animatedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-8">
      <h2
        className="mb-8 text-center text-3xl font-bold md:text-4xl"
        style={{
          opacity: titleProgress,
          transform: `translateY(${interpolate(titleProgress, [0, 1], [-20, 0])}px)`,
        }}
      >
        {title}
      </h2>

      <div
        className="h-[50vh] w-full max-w-3xl md:h-[60vh]"
        style={{
          opacity: interpolate(
            frame,
            [fps * 0.2, fps * 0.5],
            [0, 1],
            { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
          ),
        }}
      >
        {renderChart()}
      </div>
    </AbsoluteFill>
  );
}
