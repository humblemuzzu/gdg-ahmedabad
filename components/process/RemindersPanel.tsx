"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Reminder,
  loadReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  getRemindersByCase,
  requestNotificationPermission,
  getNotificationPermission,
  generateRemindersFromTimeline,
  createQuickReminder,
  startReminderChecks,
  formatReminderDate,
  formatReminderTime,
  sendTestNotification,
  type TimelineStep,
} from "@/lib/services/reminders";

interface RemindersPanelProps {
  caseId: string;
  steps?: Array<{
    id: string;
    title: string;
    eta: string;
    owner: string;
  }>;
  // Text-only reminders from agent output
  agentReminders?: string[];
}

const categoryIcons: Record<Reminder["category"], string> = {
  deadline: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  follow_up: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  document: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  visit: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  payment: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  custom: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
};

const priorityColors: Record<Reminder["priority"], string> = {
  high: "text-destructive border-destructive/30 bg-destructive/10",
  medium: "text-warning border-warning/30 bg-warning/10",
  low: "text-muted-foreground border-border bg-muted/30",
};

const statusColors: Record<Reminder["status"], string> = {
  pending: "bg-info/10 text-info",
  sent: "bg-warning/10 text-warning",
  dismissed: "bg-muted text-muted-foreground",
  completed: "bg-success/10 text-success",
};

export function RemindersPanel({ caseId, steps, agentReminders }: RemindersPanelProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0], // Default to today
    dueTime: "10:00",
    priority: "medium" as Reminder["priority"],
    category: "custom" as Reminder["category"],
  });

  // Load reminders and check notification permission
  useEffect(() => {
    setReminders(getRemindersByCase(caseId));
    setNotificationPermission(getNotificationPermission());
    
    // Start background reminder checks
    startReminderChecks();
  }, [caseId]);

  // Auto-generate reminders from timeline if none exist
  const generateFromTimeline = useCallback(() => {
    if (!steps || steps.length === 0) return;
    
    const timelineSteps: TimelineStep[] = steps.map(s => ({
      id: s.id,
      title: s.title,
      eta: s.eta,
      owner: s.owner,
    }));
    
    const generated = generateRemindersFromTimeline(caseId, timelineSteps);
    setReminders(getRemindersByCase(caseId));
    
    if (generated.length > 0) {
      alert(`Generated ${generated.length} reminders from your timeline!`);
    }
  }, [caseId, steps]);

  // Request notification permission
  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    
    if (permission === "granted") {
      // Send a test notification
      new Notification("Notifications Enabled!", {
        body: "You'll now receive reminders for your government processes.",
        icon: "/favicon.svg",
      });
    }
  };

  // Add new reminder
  const handleAddReminder = () => {
    if (!newReminder.title || !newReminder.dueDate) return;
    
    const [hours, minutes] = newReminder.dueTime.split(":").map(Number);
    const dueDate = new Date(newReminder.dueDate);
    dueDate.setHours(hours, minutes, 0, 0);
    
    createReminder({
      caseId,
      title: newReminder.title,
      description: newReminder.description,
      dueDate,
      priority: newReminder.priority,
      category: newReminder.category,
    });
    
    setReminders(getRemindersByCase(caseId));
    setShowAddReminder(false);
    setNewReminder({
      title: "",
      description: "",
      dueDate: new Date().toISOString().split("T")[0], // Reset to today
      dueTime: "10:00",
      priority: "medium",
      category: "custom",
    });
  };

  // Quick add reminder
  const handleQuickAdd = (preset: "today" | "tomorrow" | "in_3_days" | "in_week" | "in_month", title: string) => {
    createQuickReminder(caseId, preset, title, `Reminder: ${title}`);
    setReminders(getRemindersByCase(caseId));
  };

  // Mark reminder as completed
  const handleComplete = (id: string) => {
    updateReminder(id, { status: "completed" });
    setReminders(getRemindersByCase(caseId));
  };

  // Dismiss reminder
  const handleDismiss = (id: string) => {
    updateReminder(id, { status: "dismissed" });
    setReminders(getRemindersByCase(caseId));
  };

  // Delete reminder
  const handleDelete = (id: string) => {
    deleteReminder(id);
    setReminders(getRemindersByCase(caseId));
  };

  // Update reminder time
  const handleUpdateTime = (id: string, newDate: string, newTime: string) => {
    const [hours, minutes] = newTime.split(":").map(Number);
    const reminderTime = new Date(newDate);
    reminderTime.setHours(hours, minutes, 0, 0);
    
    updateReminder(id, { reminderTime: reminderTime.toISOString() });
    setReminders(getRemindersByCase(caseId));
  };

  // Sort reminders: pending first, then by due date
  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const pendingCount = reminders.filter(r => r.status === "pending").length;

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Reminders & Follow-ups</h3>
          <p className="text-sm text-muted-foreground">
            {pendingCount > 0 ? `${pendingCount} pending reminder${pendingCount > 1 ? "s" : ""}` : "Track your deadlines"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {steps && steps.length > 0 && reminders.length === 0 && (
            <Button variant="outline" size="sm" onClick={generateFromTimeline}>
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Auto-Generate
            </Button>
          )}
          <Button variant="default" size="sm" onClick={() => setShowAddReminder(true)}>
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Reminder
          </Button>
        </div>
      </div>

      {/* Notification Permission Banner */}
      {notificationPermission !== "granted" ? (
        <div className="rounded-lg border-2 border-warning/30 bg-warning/5 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning text-warning-foreground">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Enable Browser Notifications</p>
                <p className="text-sm text-muted-foreground">Get reminded even when you&apos;re not on this page</p>
              </div>
            </div>
            <Button onClick={handleRequestPermission}>
              Enable Notifications
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-success/30 bg-success/5 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success text-success-foreground">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-success">Notifications Enabled</p>
                <p className="text-sm text-muted-foreground">You&apos;ll receive browser alerts for your reminders</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const result = sendTestNotification();
                alert(result.message);
              }}
            >
              Test Notification
            </Button>
          </div>
        </div>
      )}

      {/* Add Reminder Form */}
      {showAddReminder && (
        <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">New Reminder</h4>
            <button onClick={() => setShowAddReminder(false)} className="text-muted-foreground hover:text-foreground">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <input
                type="text"
                value={newReminder.title}
                onChange={e => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Follow up on FSSAI"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={newReminder.category}
                onChange={e => setNewReminder(prev => ({ ...prev, category: e.target.value as Reminder["category"] }))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="follow_up">Follow-up</option>
                <option value="deadline">Deadline</option>
                <option value="document">Document</option>
                <option value="visit">Office Visit</option>
                <option value="payment">Payment</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={newReminder.description}
              onChange={e => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add any notes or details..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date *</label>
              <input
                type="date"
                value={newReminder.dueDate}
                onChange={e => setNewReminder(prev => ({ ...prev, dueDate: e.target.value }))}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Remind At</label>
              <input
                type="time"
                value={newReminder.dueTime}
                onChange={e => setNewReminder(prev => ({ ...prev, dueTime: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select
                value={newReminder.priority}
                onChange={e => setNewReminder(prev => ({ ...prev, priority: e.target.value as Reminder["priority"] }))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          
          {/* Quick Add Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">Quick add:</span>
            <button
              onClick={() => handleQuickAdd("today", newReminder.title || "Follow-up")}
              className="text-xs px-2 py-1 rounded bg-primary/20 hover:bg-primary/30 text-primary font-medium"
            >
              Today
            </button>
            <button
              onClick={() => handleQuickAdd("tomorrow", newReminder.title || "Follow-up")}
              className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80"
            >
              Tomorrow
            </button>
            <button
              onClick={() => handleQuickAdd("in_3_days", newReminder.title || "Follow-up")}
              className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80"
            >
              In 3 Days
            </button>
            <button
              onClick={() => handleQuickAdd("in_week", newReminder.title || "Follow-up")}
              className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80"
            >
              In 1 Week
            </button>
            <button
              onClick={() => handleQuickAdd("in_month", newReminder.title || "Follow-up")}
              className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80"
            >
              In 1 Month
            </button>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowAddReminder(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddReminder} disabled={!newReminder.title || !newReminder.dueDate}>
              Create Reminder
            </Button>
          </div>
        </div>
      )}

      {/* Reminders List */}
      {sortedReminders.length > 0 ? (
        <div className="space-y-3">
          {sortedReminders.map(reminder => {
            const isOverdue = new Date(reminder.dueDate) < new Date() && reminder.status === "pending";
            
            return (
              <div
                key={reminder.id}
                className={`rounded-lg border-2 p-4 transition-all ${
                  reminder.status === "completed" ? "opacity-60 border-success/30 bg-success/5" :
                  reminder.status === "dismissed" ? "opacity-40 border-border bg-muted/30" :
                  isOverdue ? "border-destructive/50 bg-destructive/5" :
                  priorityColors[reminder.priority]
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${
                    reminder.status === "completed" ? "bg-success text-success-foreground" :
                    reminder.status === "dismissed" ? "bg-muted text-muted-foreground" :
                    isOverdue ? "bg-destructive text-destructive-foreground" :
                    reminder.priority === "high" ? "bg-destructive/20 text-destructive" :
                    "bg-info/20 text-info"
                  }`}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={categoryIcons[reminder.category]} />
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`font-medium ${reminder.status === "completed" ? "line-through" : ""}`}>
                          {reminder.title}
                        </p>
                        {reminder.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">{reminder.description}</p>
                        )}
                      </div>
                      <Badge className={statusColors[reminder.status]}>
                        {reminder.status}
                      </Badge>
                    </div>
                    
                    {/* Due Date & Actions */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-4 text-sm">
                        <div className={`flex items-center gap-1.5 ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatReminderDate(reminder.dueDate)}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatReminderTime(reminder.reminderTime)}
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">{reminder.category.replace("_", " ")}</Badge>
                      </div>
                      
                      {reminder.status === "pending" && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleComplete(reminder.id)}
                            className="p-1.5 rounded hover:bg-success/20 text-success transition-colors"
                            title="Mark as completed"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDismiss(reminder.id)}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors"
                            title="Dismiss"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(reminder.id)}
                            className="p-1.5 rounded hover:bg-destructive/20 text-destructive transition-colors"
                            title="Delete"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="font-medium mb-1">No Reminders Set</p>
          <p className="text-sm max-w-xs mx-auto mb-4">
            Create reminders to track deadlines and follow-ups for your government process.
          </p>
          {steps && steps.length > 0 && (
            <Button variant="outline" onClick={generateFromTimeline}>
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate from Timeline
            </Button>
          )}
        </div>
      )}

      {/* Agent Reminders (text-only from AI) */}
      {agentReminders && agentReminders.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm font-semibold mb-3">AI Suggested Follow-ups</p>
          <div className="space-y-2">
            {agentReminders.map((reminder, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-info">•</span>
                <span className="text-muted-foreground">{reminder}</span>
                <button
                  onClick={() => {
                    setNewReminder(prev => ({ ...prev, title: reminder.slice(0, 50), description: reminder }));
                    setShowAddReminder(true);
                  }}
                  className="text-xs text-primary hover:underline ml-auto flex-shrink-0"
                >
                  Set Reminder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pro Tips */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm font-semibold mb-2">Pro Tips</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Government offices often have 15-30 day follow-up windows</li>
          <li>• Always follow up on pending applications after the expected timeline</li>
          <li>• Keep your browser notifications enabled to never miss a deadline</li>
        </ul>
      </div>
    </div>
  );
}
