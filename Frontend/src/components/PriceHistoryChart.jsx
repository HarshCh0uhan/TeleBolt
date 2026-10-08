import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { getPriceHistory } from '../api/plans.api';

/*
  TODO: You will fetch price history for a specific plan.
  Expected API response shape:
  [
    { _id: "...", oldPrice: 249, newPrice: 299, createdAt: "2025-01-15T10:30:00Z" },
    { _id: "...", oldPrice: 229, newPrice: 249, createdAt: "2025-03-10T08:00:00Z" },
    ...
  ]
*/

const mockPriceHistory = [
  { _id: '1', oldPrice: 179, newPrice: 199, createdAt: '2025-01-15T10:30:00Z' },
  { _id: '2', oldPrice: 199, newPrice: 229, createdAt: '2025-03-10T08:00:00Z' },
  { _id: '3', oldPrice: 229, newPrice: 249, createdAt: '2025-04-20T14:15:00Z' },
  { _id: '4', oldPrice: 249, newPrice: 279, createdAt: '2025-06-01T09:45:00Z' },
  { _id: '5', oldPrice: 279, newPrice: 299, createdAt: '2025-06-15T16:00:00Z' },
];

const PriceHistoryChart = ({ planId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getPriceHistory(planId);
        console.log(data);        
        setHistory(data.history);
        setLoading(false);
      } catch (err) {
        setError('Failed to load price history');
        setLoading(false);
      }
    };
    if (planId) fetchHistory();
  }, [planId]);

  // --- States ---
  if (loading) {
    return (
      <div className="flex h-56 w-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#262626] px-4 text-center sm:h-72">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#58c28d]/30 border-t-[#58c28d]" />
          <p className="text-sm text-zinc-500">Loading price history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-56 w-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#262626] px-4 text-center sm:h-72">
        <p className="break-words text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex h-56 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#262626] px-4 text-center sm:h-72">
        <Sparkles className="h-10 w-10 text-zinc-600" />
        <p className="mt-4 text-sm font-medium text-zinc-500">No price history yet</p>
        <p className="mt-2 max-w-xs text-xs text-zinc-600">Changes will appear here once detected and approved</p>
      </div>
    );
  }

  // --- Chart data ---
  const points = history.map((entry) => ({
    date: new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }),
    fullDate: new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    price: entry.newPrice,
  }));

  const prices = points.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  const isTrendingUp = prices[prices.length - 1] > prices[0];

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 240;
  const paddingX = 45;
  const paddingTop = 30;
  const paddingBottom = 35;
  const graphWidth = svgWidth - paddingX * 2;
  const graphHeight = svgHeight - paddingTop - paddingBottom;

  // Scale functions
  const getX = (index) => {
    if (points.length === 1) return svgWidth / 2;
    return paddingX + (index / (points.length - 1)) * graphWidth;
  };

  const getY = (price) => {
    return paddingTop + graphHeight - ((price - minPrice) / priceRange) * graphHeight;
  };

  // Build SVG path
  const linePath = points
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(point.price)}`)
    .join(' ');

  // Gradient area under the line
  const areaPath =
    `${linePath} L ${getX(points.length - 1)} ${paddingTop + graphHeight} L ${getX(0)} ${paddingTop + graphHeight} Z`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative min-w-0 rounded-2xl border border-white/10 bg-[#262626] p-4 sm:p-5"
    >
      {/* Header */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="flex min-w-0 items-center gap-2">
          {isTrendingUp ? (
            <TrendingUp className="h-5 w-5 shrink-0 text-red-400" />
          ) : (
            <TrendingDown className="h-5 w-5 shrink-0 text-[#58c28d]" />
          )}
          <span className="text-sm font-medium text-white">Price trend</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500 sm:gap-4">
          <span>Min: <span className="text-white">₹{minPrice}</span></span>
          <span>Max: <span className="text-white">₹{maxPrice}</span></span>
        </div>
      </div>

      {/* SVG Line Graph */}
      <div className="relative w-full min-w-0">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="h-auto w-full">
          {/* Gradient definition */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#58c28d" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#58c28d" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines with price labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + ratio * graphHeight;
            const price = maxPrice - ratio * priceRange;
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#ffffff"
                  strokeOpacity="0.06"
                  strokeDasharray="5 5"
                />
                <text x={paddingX - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-zinc-500">
                  ₹{Math.round(price)}
                </text>
              </g>
            );
          })}

          {/* Area under the line */}
          <motion.path
            d={areaPath}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* The line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="#58c28d"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />

          {/* Data points */}
          {points.map((point, i) => (
            <motion.circle
              key={i}
              cx={getX(i)}
              cy={getY(point.price)}
              r={hoveredIndex === i ? 7 : 4}
              fill={hoveredIndex === i ? '#58c28d' : '#181818'}
              stroke="#58c28d"
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
              style={{ filter: hoveredIndex === i ? 'drop-shadow(0 0 6px rgba(88,194,141,0.6))' : 'none' }}
            />
          ))}

          {/* Date labels on x-axis */}
          {points.map((point, i) => (
            <text
              key={`date-${i}`}
              x={getX(i)}
              y={svgHeight - 8}
              textAnchor="middle"
              className="text-[10px] fill-zinc-500"
            >
              {point.date}
            </text>
          ))}
        </svg>
      </div>

      {/* Hover tooltip — positioned absolutely over the chart */}
      {hoveredIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute z-20 pointer-events-none rounded-xl border border-white/10 bg-[#1f1f1f] px-3.5 py-2.5 shadow-xl shadow-black/40"
          style={{
            left: `${((getX(hoveredIndex) / svgWidth) * 100).toFixed(1)}%`,
            top: `${((getY(points[hoveredIndex].price) / svgHeight) * 100).toFixed(1) - 12}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="text-sm font-semibold text-[#58c28d]">₹{points[hoveredIndex].price}</p>
          <p className="mt-0.5 text-[11px] text-zinc-400">{points[hoveredIndex].fullDate}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PriceHistoryChart;