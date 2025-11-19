import { useEffect, useState } from 'react'
import './PresenceList.css'

export default function PresenceList({ provider }) {
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (!provider) return

    const updateUsers = () => {
      const awareness = provider.awareness
      const states = Array.from(awareness.getStates().entries())

      const activeUsers = states
        .filter(([clientId]) => clientId !== awareness.clientID)
        .map(([clientId, state]) => ({
          clientId,
          name: state.user?.name || 'Anonymous',
          color: state.user?.color || '#000000',
        }))

      setUsers(activeUsers)
    }

    provider.awareness.on('change', updateUsers)
    updateUsers()

    return () => {
      provider.awareness.off('change', updateUsers)
    }
  }, [provider])

  if (users.length === 0) {
    return (
      <div className="presence-list">
        <p className="presence-empty">Only you are here</p>
      </div>
    )
  }

  return (
    <div className="presence-list">
      <h3>Active Users ({users.length})</h3>
      <ul>
        {users.map((user) => (
          <li key={user.clientId}>
            <span
              className="presence-dot"
              style={{ backgroundColor: user.color }}
            />
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
