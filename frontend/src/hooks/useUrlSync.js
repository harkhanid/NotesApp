import { useEffect } from 'react';
import { useParams, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentNote } from '../store/notesSlice';
import { updateFilter, selectTag, setSearchNotes } from '../store/uiSlice';

/**
 * Custom hook to synchronize URL state with Redux state
 * Reads URL parameters and updates Redux on route changes
 * This makes the URL the source of truth for navigation state
 */
export const useUrlSync = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const notesById = useSelector((state) => state.notes.byId);

  useEffect(() => {
    // Extract URL state
    const { noteId, tagName } = params;
    const searchQuery = searchParams.get('q') || '';
    const path = location.pathname;

    // Determine filter based on URL path
    let filter = 'MY_NOTES';
    if (path.startsWith('/dashboard/shared')) {
      filter = 'SHARED_NOTES';
    } else if (path.startsWith('/dashboard/search')) {
      filter = 'SEARCH';
    } else if (path.startsWith('/dashboard/tags')) {
      filter = 'TAG';
    } else if (path === '/settings') {
      filter = 'SETTINGS';
    }

    // Sync filter to Redux
    dispatch(updateFilter({ filter }));

    // Sync tag if present
    if (tagName) {
      dispatch(selectTag({ tag: decodeURIComponent(tagName) }));
    } else if (filter === 'TAG') {
      // In tags view but no specific tag selected
      dispatch(selectTag({ tag: '' }));
    }

    // Sync search query if present
    if (searchQuery) {
      dispatch(setSearchNotes({ query: searchQuery }));
    }

    // Sync selected note
    if (noteId) {
      // Check if note exists in store
      const noteExists = notesById[noteId] !== undefined;

      if (noteExists) {
        dispatch(setCurrentNote({ id: noteId }));
      } else if (!noteId.startsWith('temp-')) {
        // Invalid noteId (not found and not a temp note)
        // Redirect to base filter URL without noteId
        console.warn(`Note ${noteId} not found, redirecting to base filter`);

        // Remove noteId from URL
        const basePath = path.split('/').slice(0, -1).join('/') || '/dashboard';
        navigate(basePath, { replace: true });
      }
    } else {
      // No noteId in URL
      dispatch(setCurrentNote({ id: null }));
    }
  }, [location.pathname, params, searchParams, dispatch, notesById, navigate]);
};

export default useUrlSync;
