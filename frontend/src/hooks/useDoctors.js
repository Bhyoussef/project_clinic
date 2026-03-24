import { useCallback, useEffect, useState } from 'react';
import { getDoctors } from '../services/doctorService';
import { mapDoctorForDisplay } from '../utils/doctorPresentation';

export function useDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getDoctors();
      setDoctors(response.doctors.map(mapDoctorForDisplay));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load doctors.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  return {
    doctors,
    loading,
    error,
    reloadDoctors: loadDoctors,
  };
}
