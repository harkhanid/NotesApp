import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import './CollaboratorsList.css';

export default function CollaboratorsList({ note, provider }) {
  const [activeUsers, setActiveUsers] = useState(new Map());
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!provider || !provider.awareness) {
      return;
    }

    const updateActiveUsers = () => {
      const awareness = provider.awareness;
      const states = Array.from(awareness.getStates().entries());

      // Create a map of active users by email
      const activeUsersMap = new Map();
      states.forEach(([clientId, state]) => {
        if (state.user && state.user.email) {
          activeUsersMap.set(state.user.email, {
            name: state.user.name || 'Anonymous',
            color: state.user.color || '#808080',
          });
        }
      });

      setActiveUsers(activeUsersMap);
    };

    provider.awareness.on('change', updateActiveUsers);
    updateActiveUsers();

    return () => {
      provider.awareness.off('change', updateActiveUsers);
    };
  }, [provider]);

  if (!note || !currentUser) {
    return null;
  }

  // Build list of all users except current user
  const allUsers = [];

  // Add owner if they're not the current user
  if (note.owner && note.owner.id !== currentUser.id) {
    allUsers.push({
      id: note.owner.id,
      email: note.owner.email,
      name: note.owner.name,
      isOwner: true
    });
  }

  // Add collaborators except current user
  if (note.sharedWith) {
    note.sharedWith.forEach((collaborator) => {
      if (collaborator.id !== currentUser.id) {
        allUsers.push({
          id: collaborator.id,
          email: collaborator.email,
          name: collaborator.name,
          isOwner: false
        });
      }
    });
  }

  return (
    <div className="collaborators-list-container flow-content xxs-spacer">
      <p className="section-title">Collaborators</p>
      {
        allUsers.length === 0 ? (
          <p className="preset-5 collabration-text">No collaborators. Click on share Note to add collabrators</p>
        ) : <ul className="collaborators-list flow-content xxs-spacer">
        {allUsers.map((user) => {
          const isOnline = activeUsers.has(user.email);
          const activeUser = activeUsers.get(user.email);
          const displayName = user.name || user.email;
          const color = isOnline && activeUser ? activeUser.color : '#d3d3d3';


          return (
            <li key={user.id} className="collaborator-item">
              <span
                className="collaborator-dot"
                style={{ backgroundColor: color }}
              />
              <span className={`collaborator-name ${!isOnline ? 'offline' : ''}`}>
                {displayName} {user.isOwner && '(Owner)'}
              </span>
            </li>
          );
        })}
      </ul>
      }
      
    </div>
  );
}
