import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ChartConfig } from "../types";

interface ChartBlockProps {
  config: ChartConfig;
  onUpdate?: (config: ChartConfig) => void;
  isEditing?: boolean;
}

export function ChartBlock({ config }: ChartBlockProps) {
  const chartColor = 'hsl(43, 100%, 50%)';
  
  const renderChart = () => {
    const commonProps = {
      data: config.data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    switch (config.type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 18%)" />
            <XAxis dataKey="name" stroke="hsl(240, 4%, 66%)" fontSize={12} />
            <YAxis stroke="hsl(240, 4%, 66%)" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0, 0%, 7%)', 
                border: '1px solid hsl(0, 0%, 18%)',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 18%)" />
            <XAxis dataKey="name" stroke="hsl(240, 4%, 66%)" fontSize={12} />
            <YAxis stroke="hsl(240, 4%, 66%)" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0, 0%, 7%)', 
                border: '1px solid hsl(0, 0%, 18%)',
                borderRadius: '8px'
              }}
            />
            <Area type="monotone" dataKey="value" stroke={chartColor} fill={chartColor} fillOpacity={0.3} />
          </AreaChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 18%)" />
            <XAxis dataKey="name" stroke="hsl(240, 4%, 66%)" fontSize={12} />
            <YAxis stroke="hsl(240, 4%, 66%)" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0, 0%, 7%)', 
                border: '1px solid hsl(0, 0%, 18%)',
                borderRadius: '8px'
              }}
            />
            <Line type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} dot={{ fill: chartColor }} />
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      {config.title && (
        <h4 className="text-sm font-semibold text-foreground mb-4">{config.title}</h4>
      )}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
