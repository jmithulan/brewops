import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Hook that provides a pageVisible flag and a navigateWithTransition helper.
// Usage:
// const { pageVisible, navigateWithTransition } = useNavigateWithTransition();
// Wrap page root with classes depending on pageVisible and call navigateWithTransition(path) to navigate.
export default function useNavigateWithTransition(defaultVisible = true, duration = 320) {
  const navigate = useNavigate();
  const [pageVisible, setPageVisible] = useState(false);

  useEffect(() => {
    // small delay to allow CSS to pick up the enter transition
    const t = setTimeout(() => setPageVisible(defaultVisible), 10);
    return () => clearTimeout(t);
  }, [defaultVisible]);

  const navigateWithTransition = (path, delay = duration) => {
    setPageVisible(false);
    setTimeout(() => navigate(path), delay);
  };

  return { pageVisible, navigateWithTransition, setPageVisible };
}
