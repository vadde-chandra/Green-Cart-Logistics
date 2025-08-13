import React, { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Fuel,
  Users,
  Route,
  Package
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const { simulationResults, drivers, routes, orders } = useData();
  const [latestResult, setLatestResult] = useState(simulationResults[0] || null);

  useEffect(() => {
    if (simulationResults.length > 0) {
      setLatestResult(simulationResults[0]);
    }
  }, [simulationResults]);

  const deliveryChartData = {
    labels: ['On-time Deliveries', 'Late Deliveries'],
    datasets: [
      {
        data: [
          latestResult?.on_time_deliveries || 0,
          latestResult?.late_deliveries || 0,
        ],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#059669', '#DC2626'],
        borderWidth: 2,
      },
    ],
  };

  const fuelCostData = {
    labels: ['Base Cost', 'Traffic Surcharge'],
    datasets: [
      {
        label: 'Fuel Cost (₹)',
        data: [
          latestResult?.fuel_cost_breakdown.base_cost || 0,
          latestResult?.fuel_cost_breakdown.surcharge || 0,
        ],
        backgroundColor: ['#3B82F6', '#F59E0B'],
        borderColor: ['#2563EB', '#D97706'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const stats = [
    {
      name: 'Total Drivers',
      value: drivers.length,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Routes',
      value: routes.length,
      icon: Route,
      color: 'bg-green-500',
    },
    {
      name: 'Total Orders',
      value: orders.length,
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      name: 'Simulations Run',
      value: simulationResults.length,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {latestResult && (
            <span>Last simulation: {new Date(latestResult.timestamp).toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* KPI Cards */}
      {latestResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-500 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Profit</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{latestResult.total_profit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Efficiency Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {latestResult.efficiency_score.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-orange-500 p-3 rounded-lg">
                <Fuel className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Fuel Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{latestResult.fuel_cost_breakdown.total.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {latestResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delivery Performance
            </h3>
            <div className="h-64">
              <Doughnut data={deliveryChartData} options={doughnutOptions} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Fuel Cost Breakdown
            </h3>
            <div className="h-64">
              <Bar data={fuelCostData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Recent Simulations */}
      {simulationResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Simulations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Efficiency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    On-time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Late
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {simulationResults.slice(0, 5).map((result, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(result.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{result.total_profit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.efficiency_score.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {result.on_time_deliveries}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {result.late_deliveries}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!latestResult && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Simulation Data</h3>
          <p className="text-gray-600 mb-4">
            Run your first simulation to see KPIs and analytics here.
          </p>
          <a
            href="/simulation"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Run Simulation
          </a>
        </div>
      )}
    </div>
  );
};

export default Dashboard;