import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addToast } from "../../store/toastSlice";
import adminService from "../../Service/adminService";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers(filter);
      setUsers(data);
    } catch (error) {
      dispatch(addToast({ message: "Failed to load users", type: "error" }));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await adminService.approveUser(userId);
      dispatch(addToast({ message: "User approved successfully", type: "success" }));
      fetchUsers(); // Refresh the list
    } catch (error) {
      dispatch(addToast({ message: "Failed to approve user", type: "error" }));
    }
  };

  const handleReject = async (userId) => {
    try {
      await adminService.rejectUser(userId);
      dispatch(addToast({ message: "User rejected successfully", type: "success" }));
      fetchUsers(); // Refresh the list
    } catch (error) {
      dispatch(addToast({ message: "Failed to reject user", type: "error" }));
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      await adminService.makeAdmin(userId);
      dispatch(addToast({ message: "User promoted to admin", type: "success" }));
      fetchUsers(); // Refresh the list
    } catch (error) {
      dispatch(addToast({ message: "Failed to promote user", type: "error" }));
    }
  };

  const getStatusBadge = (user) => {
    if (user.accountRejected) {
      return <span className="status-badge rejected">Rejected</span>;
    } else if (user.accountApproved) {
      return <span className="status-badge approved">Approved</span>;
    } else {
      return <span className="status-badge pending">Pending</span>;
    }
  };

  const isAdmin = (user) => {
    return user.roles && user.roles.includes("ROLE_ADMIN");
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="preset-1">Admin Dashboard</h1>
        <p className="preset-4">Manage user accounts and approvals</p>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
        <button
          className={`filter-tab ${filter === "approved" ? "active" : ""}`}
          onClick={() => setFilter("approved")}
        >
          Approved
        </button>
        <button
          className={`filter-tab ${filter === "rejected" ? "active" : ""}`}
          onClick={() => setFilter("rejected")}
        >
          Rejected
        </button>
        <button
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Users
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="users-table-container">
          {users.length === 0 ? (
            <div className="empty-state">
              <p className="preset-4">No users found for this filter</p>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.name}</td>
                    <td>
                      <span className="provider-badge">{user.provider}</span>
                    </td>
                    <td>{getStatusBadge(user)}</td>
                    <td>
                      {isAdmin(user) ? (
                        <span className="role-badge admin">Admin</span>
                      ) : (
                        <span className="role-badge user">User</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {!user.accountApproved && !user.accountRejected && (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleApprove(user.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReject(user.id)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {user.accountRejected && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleApprove(user.id)}
                          >
                            Approve
                          </button>
                        )}
                        {user.accountApproved && !isAdmin(user) && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleMakeAdmin(user.id)}
                          >
                            Make Admin
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
