import { motion } from 'framer-motion';
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
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ChartSlide as ChartSlideType, ColorTheme } from '@wrapp0r/shared';
import { getAnimationVariants } from '@/lib/animation-variants';

interface ChartSlideProps {
  slide: ChartSlideType;
  theme?: ColorTheme;
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

export function ChartSlide({ slide, theme }: ChartSlideProps) {
  const variants = getAnimationVariants(slide.animation);
  const { title, chartType, data, showLegend } = slide.content;

  // Determine if this is a dark theme (white text = dark theme)
  const isDarkTheme = theme?.text === '#FFFFFF';

  // Theme-aware tooltip styles
  // Light themes get light tooltips, dark themes get dark tooltips (matching the theme aesthetic)
  const tooltipStyle = {
    backgroundColor: isDarkTheme ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.95)',
    border: 'none',
    borderRadius: '8px',
    color: isDarkTheme ? '#FFFFFF' : '#1C1917',
    padding: '8px 12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  };

  // Theme-aware legend styles
  const legendStyle = {
    color: theme?.text || 'currentColor',
  };

  // Prepare data with colors
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: 'currentColor', opacity: 0.7 }}
                angle={-45}
                textAnchor="end"
                interval={0}
                height={80}
              />
              <YAxis tick={{ fill: 'currentColor', opacity: 0.7 }} />
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend wrapperStyle={legendStyle} />}
              <Bar
                dataKey="value"
                animationDuration={1500}
                animationBegin={300}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: 'currentColor', opacity: 0.7 }}
                angle={-45}
                textAnchor="end"
                interval={0}
                height={80}
              />
              <YAxis tick={{ fill: 'currentColor', opacity: 0.7 }} />
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend wrapperStyle={legendStyle} />}
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartData[0]?.color || DEFAULT_COLORS[0]}
                strokeWidth={3}
                dot={{ fill: chartData[0]?.color || DEFAULT_COLORS[0], r: 6 }}
                animationDuration={1500}
                animationBegin={300}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: 'currentColor', opacity: 0.7 }}
                angle={-45}
                textAnchor="end"
                interval={0}
                height={80}
              />
              <YAxis tick={{ fill: 'currentColor', opacity: 0.7 }} />
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend wrapperStyle={legendStyle} />}
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartData[0]?.color || DEFAULT_COLORS[0]}
                fill={chartData[0]?.color || DEFAULT_COLORS[0]}
                fillOpacity={0.3}
                animationDuration={1500}
                animationBegin={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={chartType === 'donut' ? '50%' : 0}
                outerRadius="80%"
                paddingAngle={2}
                dataKey="value"
                nameKey="label"
                animationDuration={1500}
                animationBegin={300}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: 'currentColor', opacity: 0.5 }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend wrapperStyle={legendStyle} />}
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center px-4 md:px-8"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.h2
        className="mb-6 text-center text-2xl font-bold md:text-4xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {title}
      </motion.h2>

      <motion.div
        className="h-[50vh] w-full max-w-4xl md:h-[60vh]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {renderChart()}
      </motion.div>
    </motion.div>
  );
}
