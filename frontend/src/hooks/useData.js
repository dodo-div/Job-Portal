import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '../services/api';

const pending = { loading: true, data: null, error: '' };

export default function useData(load, fallback) {
  const [state, setState] = useState(null);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion(current => current + 1), []);
  const setData = useCallback(update => setState(current => current?.data ? { ...current, data: update(current.data) } : current), []);
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then(data => {
      if (!controller.signal.aborted) setState({ load, version, loading: false, data, error: '' });
    }).catch(error => {
      if (!controller.signal.aborted) setState({ load, version, loading: false, data: null, error: errorMessage(error, fallback) });
    });
    return () => controller.abort();
  }, [load, version, fallback]);
  const current = state?.load === load && state.version === version ? state : pending;
  return { data: current.data, loading: current.loading, error: current.error, reload, setData };
}
