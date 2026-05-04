"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Task, TaskStatus, TaskPriority } from "@/lib/tasks";
import {
  getTasks,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  getTaskStats,
  groupTasksByStatus,
} from "@/lib/tasks";
import type { OnboardingData } from "@/lib/onboarding";

type FilterView = "all" | "open" | "in_progress" | "completed" | "overdue";

export default function TasksPage() {
  const [profile, setProfile] = useState<OnboardingData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterView, setFilterView] = useState<FilterView>("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "created">("created");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [stats, setStats] = useState(
    { total: 0, open: 0, inProgress: 0, completed: 0, overdue: 0, highPriority: 0 }
  );

  useEffect(() => {
    // Load profile
    const savedProfile = localStorage.getItem("onboarding_profile");
    if (savedProfile) setProfile(JSON.parse(savedProfile));

    // Load tasks
    const allTasks = getTasks();
    setTasks(allTasks);
    setStats(getTaskStats());
  }, []);

  const getFilteredTasks = (): Task[] => {
    let filtered = tasks;

    if (filterView === "open") {
      filtered = filtered.filter((t) => t.status === "open");
    } else if (filterView === "in_progress") {
      filtered = filtered.filter((t) => t.status === "in_progress");
    } else if (filterView === "completed") {
      filtered = filtered.filter((t) => t.status === "completed");
    } else if (filterView === "overdue") {
      filtered = filtered.filter((t) => {
        if (!t.dueDate || t.status === "completed") return false;
        return new Date(t.dueDate) < new Date();
      });
    }

    // Sort
    if (sortBy === "dueDate") {
      filtered.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (sortBy === "priority") {
      const priorityMap = { high: 0, medium: 1, low: 2 };
      filtered.sort(
        (a, b) => priorityMap[a.priority] - priorityMap[b.priority]
      );
    }

    return filtered;
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    const task = createTask(newTaskTitle, {
      priority: newTaskPriority,
      dueDate: newTaskDueDate || undefined,
      role: profile?.role,
    });

    setTasks([...tasks, task]);
    setStats(getTaskStats());
    setNewTaskTitle("");
    setNewTaskPriority("medium");
    setNewTaskDueDate("");
    setShowAddForm(false);
  };

  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    const updated = updateTask(id, { status: newStatus });
    if (updated) {
      setTasks(tasks.map((t) => (t.id === id ? updated : t)));
      setStats(getTaskStats());
    }
  };

  const handleDeleteTask = (id: string) => {
    if (deleteTask(id)) {
      setTasks(tasks.filter((t) => t.id !== id));
      setStats(getTaskStats());
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <main className="page">
      <div className="stack">
        <Link className="back" href="/dashboard">
          ← Dashboard
        </Link>

        <section className="card">
          <p className="eyebrow">Task Management</p>
          <h1>Your Tasks</h1>
          {profile && (
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              {profile.businessName} • {profile.role?.replaceAll("_", " ")}
            </p>
          )}
        </section>

        {/* Stats */}
        <section className="dashboard-grid">
          <div className="card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.85rem", color: "#999" }}>Total Tasks</p>
            <h2 style={{ margin: "0.5rem 0" }}>{stats.total}</h2>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.85rem", color: "#999" }}>Open</p>
            <h2 style={{ margin: "0.5rem 0" }}>{stats.open}</h2>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.85rem", color: "#999" }}>In Progress</p>
            <h2 style={{ margin: "0.5rem 0" }}>{stats.inProgress}</h2>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.85rem", color: "#999" }}>Completed</p>
            <h2 style={{ margin: "0.5rem 0" }}>{stats.completed}</h2>
          </div>
          {stats.overdue > 0 && (
            <div className="card" style={{ textAlign: "center", background: "#ffebee" }}>
              <p style={{ fontSize: "0.85rem", color: "#c62828" }}>Overdue</p>
              <h2 style={{ margin: "0.5rem 0", color: "#c62828" }}>{stats.overdue}</h2>
            </div>
          )}
          {stats.highPriority > 0 && (
            <div className="card" style={{ textAlign: "center", background: "#fff3e0" }}>
              <p style={{ fontSize: "0.85rem", color: "#e65100" }}>High Priority</p>
              <h2 style={{ margin: "0.5rem 0", color: "#e65100" }}>{stats.highPriority}</h2>
            </div>
          )}
        </section>

        {/* Add Task Form */}
        {showAddForm && (
          <section className="card">
            <h2>Add New Task</h2>
            <div className="fields">
              <label htmlFor="taskTitle">
                Task
                <input
                  id="taskTitle"
                  type="text"
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTask();
                  }}
                  autoFocus
                />
              </label>

              <label htmlFor="taskPriority">
                Priority
                <select
                  id="taskPriority"
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>

              <label htmlFor="taskDueDate">
                Due Date (optional)
                <input
                  id="taskDueDate"
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
              </label>
            </div>

            <div className="actions">
              <button type="button" className="button" onClick={handleAddTask}>
                Add Task
              </button>
              <button
                type="button"
                className="button ghost"
                onClick={() => {
                  setShowAddForm(false);
                  setNewTaskTitle("");
                }}
              >
                Cancel
              </button>
            </div>
          </section>
        )}

        {!showAddForm && (
          <div style={{ marginBottom: "1rem" }}>
            <button
              type="button"
              className="button"
              onClick={() => setShowAddForm(true)}
            >
              + Add Task
            </button>
          </div>
        )}

        {/* Filters */}
        <section className="card">
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {(["all", "open", "in_progress", "completed", "overdue"] as FilterView[]).map(
              (view) => (
                <button
                  key={view}
                  type="button"
                  className={filterView === view ? "chip active" : "chip"}
                  onClick={() => setFilterView(view)}
                >
                  {view === "in_progress" ? "In Progress" : view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              )
            )}
          </div>
        </section>

        {/* Tasks List */}
        {filteredTasks.length > 0 ? (
          <section className="card">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  borderBottom: "1px solid #e0e0e0",
                  paddingBottom: "1rem",
                  marginBottom: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  gap: "1rem"
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={task.status === "completed"}
                      onChange={(e) => {
                        const newStatus = e.target.checked ? "completed" : "open";
                        handleStatusChange(task.id, newStatus);
                      }}
                    />
                    <strong
                      style={{
                        textDecoration:
                          task.status === "completed" ? "line-through" : "none",
                        opacity: task.status === "completed" ? 0.6 : 1
                      }}
                    >
                      {task.title}
                    </strong>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        background:
                          task.priority === "high"
                            ? "#ffebee"
                            : task.priority === "medium"
                              ? "#fff3e0"
                              : "#f1f8e9",
                        color:
                          task.priority === "high"
                            ? "#c62828"
                            : task.priority === "medium"
                              ? "#e65100"
                              : "#558b2f"
                      }}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.85rem", color: "#999", marginTop: "0.5rem" }}>
                    {task.dueDate && (
                      <span>
                        Due:{" "}
                        {new Date(task.dueDate).toLocaleDateString()}
                        {new Date(task.dueDate) < new Date() && task.status !== "completed" && (
                          <span style={{ color: "#c62828", fontWeight: "bold" }}> (OVERDUE)</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(task.id, e.target.value as TaskStatus)
                    }
                    style={{ fontSize: "0.85rem", padding: "0.25rem" }}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    style={{
                      background: "#ffebee",
                      color: "#c62828",
                      border: "none",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.85rem"
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </section>
        ) : (
          <section className="card">
            <p style={{ textAlign: "center", color: "#999" }}>
              No {filterView !== "all" ? filterView.replaceAll("_", " ") : ""} tasks yet.{" "}
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2196f3",
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
              >
                Create one
              </button>
            </p>
          </section>
        )}
      </div>

      <style jsx>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        .chip {
          padding: 0.5rem 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 20px;
          background: white;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .chip:hover {
          border-color: #2196f3;
          color: #2196f3;
        }

        .chip.active {
          background: #2196f3;
          color: white;
          border-color: #2196f3;
        }

        .fields {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-weight: 500;
        }

        input,
        select {
          padding: 0.75rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: #2196f3;
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
        }

        .actions {
          display: flex;
          gap: 0.75rem;
        }

        .button {
          padding: 0.75rem 1.5rem;
          background: #2196f3;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s;
        }

        .button:hover {
          background: #1976d2;
        }

        .button.ghost {
          background: transparent;
          color: #2196f3;
          border: 1px solid #2196f3;
        }

        .button.ghost:hover {
          background: #f1f5ff;
        }
      `}</style>
    </main>
  );
}
