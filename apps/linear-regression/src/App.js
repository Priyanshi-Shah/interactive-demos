import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Dot } from 'recharts';
import { Plus, RotateCcw, TrendingUp, Info, MousePointer } from 'lucide-react';

function LinearRegressionDemo() {
  const [points, setPoints] = useState([
    { x: 2, y: 3 },
    { x: 4, y: 5 },
    { x: 6, y: 7 },
    { x: 8, y: 9 }
  ]);
  
  const [regressionLine, setRegressionLine] = useState({ slope: 0, intercept: 0, rSquared: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [dragPoint, setDragPoint] = useState(null);

  function calculateRegression(data) {
    const n = data.length;
    if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 };
    
    const sumX = data.reduce((sum, point) => sum + point.x, 0);
    const sumY = data.reduce((sum, point) => sum + point.y, 0);
    const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const yMean = sumY / n;
    const ssTotal = data.reduce((sum, point) => sum + Math.pow(point.y - yMean, 2), 0);
    const ssResidual = data.reduce((sum, point) => {
      const predicted = slope * point.x + intercept;
      return sum + Math.pow(point.y - predicted, 2);
    }, 0);
    const rSquared = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0;
    
    return { slope, intercept, rSquared };
  }

  useEffect(() => {
    setRegressionLine(calculateRegression(points));
  }, [points]);

  function generateChartData() {
    const allData = [];
    
    // Add all x values from data points
    points.forEach(point => {
      allData.push({
        x: point.x,
        actualY: point.y,
        regressionY: points.length >= 2 ? regressionLine.slope * point.x + regressionLine.intercept : null,
        isDataPoint: true
      });
    });

    // Add additional points for smooth regression line
    if (points.length >= 2) {
      const minX = Math.min(...points.map(p => p.x)) - 1;
      const maxX = Math.max(...points.map(p => p.x)) + 1;
      
      for (let x = minX; x <= maxX; x += 0.5) {
        // Only add if not already a data point
        if (!points.some(p => Math.abs(p.x - x) < 0.1)) {
          allData.push({
            x: x,
            actualY: null,
            regressionY: regressionLine.slope * x + regressionLine.intercept,
            isDataPoint: false
          });
        }
      }
    }

    return allData.sort((a, b) => a.x - b.x);
  }

  function addRandomPoint() {
    const newX = Math.round((Math.random() * 12 + 1) * 2) / 2;
    const newY = Math.round((Math.random() * 12 + 1) * 2) / 2;
    setPoints([...points, { x: newX, y: newY }]);
  }

  function addPointAtPosition(x, y) {
    const newPoint = {
      x: Math.max(0, Math.min(15, Math.round(x * 2) / 2)),
      y: Math.max(0, Math.min(15, Math.round(y * 2) / 2))
    };
    setPoints([...points, newPoint]);
  }

  function loadPreset(preset) {
    const presets = {
      linear: [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 6 },
        { x: 7, y: 8 },
        { x: 9, y: 10 }
      ],
      scattered: [
        { x: 2, y: 3 },
        { x: 4, y: 7 },
        { x: 6, y: 5 },
        { x: 8, y: 11 },
        { x: 10, y: 9 }
      ],
      noCorrelation: [
        { x: 2, y: 8 },
        { x: 4, y: 3 },
        { x: 6, y: 12 },
        { x: 8, y: 5 },
        { x: 10, y: 9 }
      ]
    };
    setPoints(presets[preset]);
  }

  function clearPoints() {
    setPoints([]);
  }

  function removePoint(index) {
    const newPoints = points.filter((_, i) => i !== index);
    setPoints(newPoints);
  }

  function updatePoint(index, newX, newY) {
    const newPoints = [...points];
    newPoints[index] = {
      x: Math.max(0, Math.min(15, newX)),
      y: Math.max(0, Math.min(15, newY))
    };
    setPoints(newPoints);
  }

  const chartData = generateChartData();

  // Custom dot component for data points
  const CustomDot = (props) => {
    const { cx, cy, payload, index } = props;
    if (payload && payload.isDataPoint && payload.actualY !== null) {
      return (
        <Dot
          cx={cx}
          cy={cy}
          r={6}
          fill="#3b82f6"
          stroke="#1d4ed8"
          strokeWidth={2}
          style={{ cursor: 'pointer' }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setDragPoint(index);
          }}
        />
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <TrendingUp className="text-blue-600" />
          Interactive Linear Regression
        </h1>
        <p className="text-gray-600">Add data points and watch the regression line adapt in real-time!</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Data Visualization</h2>
              <button
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Info size={20} />
              </button>
            </div>
            
            {showTooltip && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
                💡 <strong>How to use:</strong> Use the buttons below to add data points or try preset examples. 
                The red regression line automatically adjusts to best fit your data!
              </div>
            )}

            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  domain={[0, 15]} 
                  label={{ value: 'X Values', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  type="number" 
                  domain={[0, 15]}
                  label={{ value: 'Y Values', angle: -90, position: 'insideLeft' }}
                />
                
                {/* Data points */}
                <Line 
                  type="monotone" 
                  dataKey="actualY" 
                  stroke="none"
                  dot={<CustomDot />}
                  line={false}
                  connectNulls={false}
                />
                
                {/* Regression line */}
                {points.length >= 2 && (
                  <Line 
                    type="monotone" 
                    dataKey="regressionY" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    dot={false}
                    connectNulls={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={addRandomPoint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add Random Point
            </button>
            <button
              onClick={() => loadPreset('linear')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Perfect Linear
            </button>
            <button
              onClick={() => loadPreset('scattered')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Some Scatter
            </button>
            <button
              onClick={() => loadPreset('noCorrelation')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              No Correlation
            </button>
            <button
              onClick={clearPoints}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Clear All
            </button>
          </div>

          {/* Manual point addition */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <MousePointer size={16} />
              Add Custom Point
            </h3>
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">X:</label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  step="0.5"
                  className="w-20 px-2 py-1 border rounded text-center"
                  placeholder="X"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const x = parseFloat(e.target.value);
                      const y = parseFloat(e.target.parentElement.nextElementSibling.querySelector('input').value);
                      if (!isNaN(x) && !isNaN(y)) {
                        addPointAtPosition(x, y);
                        e.target.value = '';
                        e.target.parentElement.nextElementSibling.querySelector('input').value = '';
                      }
                    }
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Y:</label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  step="0.5"
                  className="w-20 px-2 py-1 border rounded text-center"
                  placeholder="Y"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const y = parseFloat(e.target.value);
                      const x = parseFloat(e.target.parentElement.previousElementSibling.querySelector('input').value);
                      if (!isNaN(x) && !isNaN(y)) {
                        addPointAtPosition(x, y);
                        e.target.value = '';
                        e.target.parentElement.previousElementSibling.querySelector('input').value = '';
                      }
                    }
                  }}
                />
              </div>
              <button
                onClick={() => {
                  const xInput = document.querySelector('input[placeholder="X"]');
                  const yInput = document.querySelector('input[placeholder="Y"]');
                  const x = parseFloat(xInput.value);
                  const y = parseFloat(yInput.value);
                  if (!isNaN(x) && !isNaN(y)) {
                    addPointAtPosition(x, y);
                    xInput.value = '';
                    yInput.value = '';
                  }
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-blue-600 mt-1">Enter X and Y values (0-15) and press Enter or click Add</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Regression Equation</h3>
            <div className="text-center">
              <div className="text-2xl font-mono bg-white p-3 rounded border">
                y = {regressionLine.slope.toFixed(2)}x + {regressionLine.intercept.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Slope (m):</span>
                <span className="font-mono font-semibold">{regressionLine.slope.toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Y-intercept (b):</span>
                <span className="font-mono font-semibold">{regressionLine.intercept.toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">R² (correlation):</span>
                <span className={`font-mono font-semibold ${regressionLine.rSquared > 0.8 ? 'text-green-600' : regressionLine.rSquared > 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {regressionLine.rSquared.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Data points:</span>
                <span className="font-semibold">{points.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Understanding R²</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <div>• <strong>R² = 1.0:</strong> Perfect fit</div>
              <div>• <strong>R² &gt; 0.8:</strong> Strong correlation</div>
              <div>• <strong>R² &gt; 0.5:</strong> Moderate correlation</div>
              <div>• <strong>R² &lt; 0.5:</strong> Weak correlation</div>
            </div>
          </div>

          {points.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Data Points</h3>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {points.map((point, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center bg-white p-2 rounded border text-sm"
                  >
                    <span className="font-mono">({point.x.toFixed(1)}, {point.y.toFixed(1)})</span>
                    <button
                      onClick={() => removePoint(index)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">How Linear Regression Works</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">The Goal</h4>
            <p>Linear regression finds the best straight line through your data points. This line minimizes the total distance between all points and the line itself.</p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">The Equation</h4>
            <p><strong>y = mx + b</strong> where 'm' is the slope (how steep the line is) and 'b' is where the line crosses the y-axis.</p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">R² Value</h4>
            <p>R² tells you how well the line fits your data. Values closer to 1.0 mean the line explains most of the variation in your data.</p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Real-World Use</h4>
            <p>Predict house prices from size, estimate sales from advertising spend, or forecast temperature from altitude!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinearRegressionDemo;