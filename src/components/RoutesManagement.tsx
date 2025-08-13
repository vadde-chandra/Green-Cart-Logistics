import React, { useState } from 'react';
import { useData, Route } from '../contexts/DataContext';
import { Route as RouteIcon, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const RoutesManagement: React.FC = () => {
  const { routes, addRoute, updateRoute, deleteRoute } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    route_id: 0,
    distance: 0,
    traffic_level: 'Medium' as 'Low' | 'Medium' | 'High',
    base_time: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'route_id' || name === 'distance' || name === 'base_time') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.route_id <= 0) {
      toast.error('Route ID must be greater than 0');
      return;
    }

    if (formData.distance <= 0) {
      toast.error('Distance must be greater than 0');
      return;
    }

    if (formData.base_time <= 0) {
      toast.error('Base time must be greater than 0');
      return;
    }

    // Check for duplicate route ID
    const existingRoute = routes.find(r => 
      r.route_id === formData.route_id && r._id !== editingRoute?._id
    );
    if (existingRoute) {
      toast.error('Route ID already exists');
      return;
    }

    try {
      if (editingRoute) {
        await updateRoute(editingRoute._id!, formData);
        toast.success('Route updated successfully');
      } else {
        await addRoute(formData);
        toast.success('Route added successfully');
      }
      
      setIsModalOpen(false);
      setEditingRoute(null);
      setFormData({
        route_id: 0,
        distance: 0,
        traffic_level: 'Medium',
        base_time: 0,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      route_id: route.route_id,
      distance: route.distance,
      traffic_level: route.traffic_level,
      base_time: route.base_time,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await deleteRoute(id);
        toast.success('Route deleted successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoute(null);
    setFormData({
      route_id: 0,
      distance: 0,
      traffic_level: 'Medium',
      base_time: 0,
    });
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-purple-500 p-3 rounded-lg">
            <RouteIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 ml-4">Routes Management</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Route
        </button>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distance (km)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Traffic Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Time (min)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuel Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {routes.map((route) => {
                const baseFuelCost = route.distance * 5;
                const surcharge = route.traffic_level === 'High' ? route.distance * 2 : 0;
                const totalFuelCost = baseFuelCost + surcharge;
                
                return (
                  <tr key={route._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{route.route_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{route.distance} km</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTrafficColor(route.traffic_level)}`}>
                        {route.traffic_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{route.base_time} min</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ₹{totalFuelCost}
                        {surcharge > 0 && (
                          <span className="text-xs text-red-600 ml-1">(+₹{surcharge})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(route)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(route._id!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {routes.length === 0 && (
          <div className="text-center py-12">
            <RouteIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No routes found. Add your first route to get started.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingRoute ? 'Edit Route' : 'Add New Route'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route ID
                </label>
                <input
                  type="number"
                  name="route_id"
                  min="1"
                  value={formData.route_id || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter route ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance (km)
                </label>
                <input
                  type="number"
                  name="distance"
                  min="0.1"
                  step="0.1"
                  value={formData.distance || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter distance in km"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Traffic Level
                </label>
                <select
                  name="traffic_level"
                  value={formData.traffic_level}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Time (minutes)
                </label>
                <input
                  type="number"
                  name="base_time"
                  min="1"
                  value={formData.base_time || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter base time in minutes"
                  required
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Estimated Fuel Cost:</strong> ₹{(formData.distance * 5 + (formData.traffic_level === 'High' ? formData.distance * 2 : 0)).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Base: ₹5/km {formData.traffic_level === 'High' && '+ ₹2/km surcharge for high traffic'}
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingRoute ? 'Update' : 'Add'} Route
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutesManagement;