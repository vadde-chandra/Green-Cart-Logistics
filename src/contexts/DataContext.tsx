import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export interface Driver {
  _id?: string;
  name: string;
  shift_hours: number;
  past_week_hours: number[];
}

export interface Route {
  _id?: string;
  route_id: number;
  distance: number;
  traffic_level: 'Low' | 'Medium' | 'High';
  base_time: number;
}

export interface Order {
  _id?: string;
  order_id: number;
  value_rs: number;
  route_id: number;
  delivery_time: string;
}

export interface SimulationResult {
  _id?: string;
  total_profit: number;
  efficiency_score: number;
  on_time_deliveries: number;
  late_deliveries: number;
  fuel_cost_breakdown: {
    base_cost: number;
    surcharge: number;
    total: number;
  };
  timestamp: string;
}

interface DataContextType {
  drivers: Driver[];
  routes: Route[];
  orders: Order[];
  simulationResults: SimulationResult[];
  loading: boolean;
  fetchDrivers: () => Promise<void>;
  fetchRoutes: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchSimulationResults: () => Promise<void>;
  addDriver: (driver: Omit<Driver, '_id'>) => Promise<void>;
  updateDriver: (id: string, driver: Omit<Driver, '_id'>) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;
  addRoute: (route: Omit<Route, '_id'>) => Promise<void>;
  updateRoute: (id: string, route: Omit<Route, '_id'>) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  addOrder: (order: Omit<Order, '_id'>) => Promise<void>;
  updateOrder: (id: string, order: Omit<Order, '_id'>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  runSimulation: (params: any) => Promise<SimulationResult>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/routes');
      setRoutes(response.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchSimulationResults = async () => {
    try {
      const response = await api.get('/simulation/history');
      setSimulationResults(response.data);
    } catch (error) {
      console.error('Error fetching simulation results:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDrivers();
      fetchRoutes();
      fetchOrders();
      fetchSimulationResults();
    }
  }, [isAuthenticated]);

  // Driver CRUD operations
  const addDriver = async (driver: Omit<Driver, '_id'>) => {
    const response = await api.post('/drivers', driver);
    setDrivers([...drivers, response.data]);
  };

  const updateDriver = async (id: string, driver: Omit<Driver, '_id'>) => {
    const response = await api.put(`/drivers/${id}`, driver);
    setDrivers(drivers.map(d => d._id === id ? response.data : d));
  };

  const deleteDriver = async (id: string) => {
    await api.delete(`/drivers/${id}`);
    setDrivers(drivers.filter(d => d._id !== id));
  };

  // Route CRUD operations
  const addRoute = async (route: Omit<Route, '_id'>) => {
    const response = await api.post('/routes', route);
    setRoutes([...routes, response.data]);
  };

  const updateRoute = async (id: string, route: Omit<Route, '_id'>) => {
    const response = await api.put(`/routes/${id}`, route);
    setRoutes(routes.map(r => r._id === id ? response.data : r));
  };

  const deleteRoute = async (id: string) => {
    await api.delete(`/routes/${id}`);
    setRoutes(routes.filter(r => r._id !== id));
  };

  // Order CRUD operations
  const addOrder = async (order: Omit<Order, '_id'>) => {
    const response = await api.post('/orders', order);
    setOrders([...orders, response.data]);
  };

  const updateOrder = async (id: string, order: Omit<Order, '_id'>) => {
    const response = await api.put(`/orders/${id}`, order);
    setOrders(orders.map(o => o._id === id ? response.data : o));
  };

  const deleteOrder = async (id: string) => {
    await api.delete(`/orders/${id}`);
    setOrders(orders.filter(o => o._id !== id));
  };

  const runSimulation = async (params: any): Promise<SimulationResult> => {
    const response = await api.post('/simulation/run', params);
    const result = response.data;
    setSimulationResults([result, ...simulationResults]);
    return result;
  };

  const value = {
    drivers,
    routes,
    orders,
    simulationResults,
    loading,
    fetchDrivers,
    fetchRoutes,
    fetchOrders,
    fetchSimulationResults,
    addDriver,
    updateDriver,
    deleteDriver,
    addRoute,
    updateRoute,
    deleteRoute,
    addOrder,
    updateOrder,
    deleteOrder,
    runSimulation,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};