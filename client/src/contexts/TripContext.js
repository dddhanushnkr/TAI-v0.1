import React, { createContext, useContext, useState } from 'react';

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [currentTrip, setCurrentTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addTrip = (trip) => {
    setTrips(prev => [...prev, trip]);
  };

  const updateTrip = (trip) => {
    setTrips(prev => prev.map(t => t.id === trip.id ? trip : t));
  };

  const deleteTrip = (tripId) => {
    setTrips(prev => prev.filter(t => t.id !== tripId));
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    currentTrip,
    trips,
    isLoading,
    error,
    setCurrentTrip,
    setTrips,
    addTrip,
    updateTrip,
    deleteTrip,
    setIsLoading,
    setError,
    clearError,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
