import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Play, Clock, Users, Settings, TrendingUp, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const Simulation: React.FC = () => {
  const { drivers, runSimulation } = useData();
  const [loading, setLoading] = useState(false);
  const [simulationParams, setSimulationParams] = useState({
    available_drivers: Math.min(drivers.length, 5),
    start_time: '09:00',
    max_hours_per_day: 8,
  });
  const [result, setResult] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSimulationParams(prev => ({
      ...prev,
      [name]: name === 'available_drivers' || name === 'max_hours_per_day' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleRunSimulation = async () => {
    if (simulationParams.available_drivers <= 0) {
      toast.error('Number of drivers must be greater than 0');
      return;
    }

    if (simulationParams.available_drivers > drivers.length) {
      toast.error(`Cannot exceed available drivers (${drivers.length})`);
      return;
    }

    if (simulationParams.max_hours_per_day <= 0 || simulationParams.max_hours_per_day > 24) {
      toast.error('Max hours per day must be between 1 and 24');
      return;
    }

    setLoading(true);
    try {
      const simulationResult = await runSimulation(simulationParams);
      setResult(simulationResult);
      toast.success('Simulation completed successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Delivery Simulation</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulation Parameters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 ml-4">
              Simulation Parameters
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline h-4 w-4 mr-1" />
                Number of Available Drivers
              </label>
              <input
                type="number"
                name="available_drivers"
                min="1"
                max={drivers.length}
                value={simulationParams.available_drivers}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum available: {drivers.length} drivers
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Route Start Time
              </label>
              <input
                type="time"
                name="start_time"
                value={simulationParams.start_time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Maximum Hours per Driver per Day
              </label>
              <input
                type="number"
                name="max_hours_per_day"
                min="1"
                max="24"
                value={simulationParams.max_hours_per_day}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 8-12 hours for optimal performance
              </p>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running Simulation...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Simulation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Simulation Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <div className="bg-green-500 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 ml-4">
              Simulation Results
            </h2>
          </div>

          {result ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Total Profit</p>
                      <p className="text-lg font-bold text-green-900">
                        ₹{result.total_profit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Efficiency Score</p>
                      <p className="text-lg font-bold text-blue-900">
                        {result.efficiency_score.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Delivery Performance</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">On-time Deliveries:</span>
                    <span className="font-medium text-green-600">{result.on_time_deliveries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Late Deliveries:</span>
                    <span className="font-medium text-red-600">{result.late_deliveries}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Fuel Cost Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Cost:</span>
                    <span className="font-medium">₹{result.fuel_cost_breakdown.base_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Traffic Surcharge:</span>
                    <span className="font-medium">₹{result.fuel_cost_breakdown.surcharge.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-900 font-medium">Total Fuel Cost:</span>
                    <span className="font-bold">₹{result.fuel_cost_breakdown.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-4">
                Simulation completed at: {new Date(result.timestamp).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Configure parameters and run simulation to see results
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Company Rules Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Rules Applied</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Late Delivery Penalty</p>
                <p className="text-gray-600">₹50 penalty if delivery time exceeds base route time + 10 minutes</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Driver Fatigue Rule</p>
                <p className="text-gray-600">30% speed decrease next day if driver works >8 hours</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <p className="font-medium">High-Value Bonus</p>
                <p className="text-gray-600">10% bonus for orders >₹1000 delivered on time</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Fuel Cost Calculation</p>
                <p className="text-gray-600">₹5/km base + ₹2/km surcharge for high traffic</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulation;