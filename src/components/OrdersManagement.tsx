import React, { useState } from 'react';
import { useData, Order } from '../contexts/DataContext';
import { Package, Plus, Edit, Trash2, Save, X, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const OrdersManagement: React.FC = () => {
  const { orders, routes, addOrder, updateOrder, deleteOrder } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    order_id: 0,
    value_rs: 0,
    route_id: 0,
    delivery_time: '01:00',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'order_id' || name === 'value_rs' || name === 'route_id') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.order_id <= 0) {
      toast.error('Order ID must be greater than 0');
      return;
    }

    if (formData.value_rs <= 0) {
      toast.error('Order value must be greater than 0');
      return;
    }

    if (formData.route_id <= 0) {
      toast.error('Please select a valid route');
      return;
    }

    // Check if route exists
    const routeExists = routes.find(r => r.route_id === formData.route_id);
    if (!routeExists) {
      toast.error('Selected route does not exist');
      return;
    }

    // Check for duplicate order ID
    const existingOrder = orders.find(o => 
      o.order_id === formData.order_id && o._id !== editingOrder?._id
    );
    if (existingOrder) {
      toast.error('Order ID already exists');
      return;
    }

    try {
      if (editingOrder) {
        await updateOrder(editingOrder._id!, formData);
        toast.success('Order updated successfully');
      } else {
        await addOrder(formData);
        toast.success('Order added successfully');
      }
      
      setIsModalOpen(false);
      setEditingOrder(null);
      setFormData({
        order_id: 0,
        value_rs: 0,
        route_id: 0,
        delivery_time: '01:00',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      order_id: order.order_id,
      value_rs: order.value_rs,
      route_id: order.route_id,
      delivery_time: order.delivery_time,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(id);
        toast.success('Order deleted successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
    setFormData({
      order_id: 0,
      value_rs: 0,
      route_id: 0,
      delivery_time: '01:00',
    });
  };

  const getRouteInfo = (routeId: number) => {
    return routes.find(r => r.route_id === routeId);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-orange-500 p-3 rounded-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 ml-4">Orders Management</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Order
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => {
                const routeInfo = getRouteInfo(order.route_id);
                return (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.order_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                        ₹{order.value_rs.toLocaleString()}
                        {order.value_rs > 1000 && (
                          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            High Value
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Route #{order.route_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatTime(order.delivery_time)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {routeInfo ? (
                        <div className="text-sm text-gray-600">
                          <div>{routeInfo.distance}km • {routeInfo.base_time}min</div>
                          <div className="text-xs">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                              routeInfo.traffic_level === 'Low' ? 'bg-green-100 text-green-800' :
                              routeInfo.traffic_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {routeInfo.traffic_level} Traffic
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">Route not found</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(order)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order._id!)}
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

        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No orders found. Add your first order to get started.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingOrder ? 'Edit Order' : 'Add New Order'}
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
                  Order ID
                </label>
                <input
                  type="number"
                  name="order_id"
                  min="1"
                  value={formData.order_id || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter order ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Value (₹)
                </label>
                <input
                  type="number"
                  name="value_rs"
                  min="1"
                  value={formData.value_rs || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter order value"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route
                </label>
                <select
                  name="route_id"
                  value={formData.route_id || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a route</option>
                  {routes.map((route) => (
                    <option key={route._id} value={route.route_id}>
                      Route #{route.route_id} - {route.distance}km ({route.traffic_level} Traffic)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Delivery Time
                </label>
                <input
                  type="time"
                  name="delivery_time"
                  value={formData.delivery_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {formData.value_rs > 1000 && (
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="text-sm text-green-800">
                    <strong>High-Value Order:</strong> This order qualifies for a 10% bonus if delivered on time!
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingOrder ? 'Update' : 'Add'} Order
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

export default OrdersManagement;