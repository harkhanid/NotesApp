import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Custom hook for navigating within the notes application
 * Provides semantic navigation functions that update the URL
 * Replaces direct Redux dispatch calls for navigation
 */
export const useNotesNavigation = () => {
  const navigate = useNavigate();

  const navigateToMyNotes = useCallback((noteId = null) => {
    if (noteId) {
      navigate(`/dashboard/note/${noteId}`);
    } else {
      navigate('/dashboard');
    }
  }, [navigate]);

  const navigateToShared = useCallback((noteId = null) => {
    if (noteId) {
      navigate(`/dashboard/shared/${noteId}`);
    } else {
      navigate('/dashboard/shared');
    }
  }, [navigate]);

  const navigateToSearch = useCallback((query = '', noteId = null, replace = false) => {
    const searchParams = query ? `?q=${encodeURIComponent(query)}` : '';

    if (noteId) {
      navigate(`/dashboard/search/${noteId}${searchParams}`, { replace });
    } else {
      navigate(`/dashboard/search${searchParams}`, { replace });
    }
  }, [navigate]);

  const navigateToTag = useCallback((tagName = null, noteId = null) => {
    if (tagName && noteId) {
      navigate(`/dashboard/tags/${encodeURIComponent(tagName)}/${noteId}`);
    } else if (tagName) {
      navigate(`/dashboard/tags/${encodeURIComponent(tagName)}`);
    } else {
      navigate('/dashboard/tags');
    }
  }, [navigate]);

  const navigateToSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    navigateToMyNotes,
    navigateToShared,
    navigateToSearch,
    navigateToTag,
    navigateToSettings,
    goBack,
  };
};

export default useNotesNavigation;
