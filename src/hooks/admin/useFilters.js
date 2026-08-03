import { useState } from 'react';

export const useFilters = (initialState = {}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [paymentFilterStatus, setPaymentFilterStatus] = useState('all');
  const [couponFilterStatus, setCouponFilterStatus] = useState('all');

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setPaymentFilterStatus('all');
    setCouponFilterStatus('all');
  };

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    paymentFilterStatus,
    setPaymentFilterStatus,
    couponFilterStatus,
    setCouponFilterStatus,
    resetFilters
  };
};