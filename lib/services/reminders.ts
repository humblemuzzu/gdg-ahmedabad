/**
 * Reminders Service
 * 
 * Manages browser notifications and reminder scheduling for the Bureaucracy Breaker app.
 * Uses localStorage to persist reminders and the Notification API for alerts.
 */

export interface Reminder {
  id: string;
  caseId: string;
  title: string;
  description: string;
  dueDate: string; // ISO string
  reminderTime: string; // ISO string - when to send notification
  priority: "high" | "medium" | "low";
  category: "deadline" | "follow_up" | "document" | "visit" | "payment" | "custom";
  status: "pending" | "sent" | "dismissed" | "completed";
  createdAt: string;
  stepId?: string; // Link to a specific timeline step
  licenseId?: string; // Link to a specific license
}

export interface ReminderCreateInput {
  caseId: string;
  title: string;
  description: string;
  dueDate: Date;
  reminderTime?: Date; // Default: 1 day before due date
  priority?: "high" | "medium" | "low";
  category?: Reminder["category"];
  stepId?: string;
  licenseId?: string;
}

const STORAGE_KEY = "bb_reminders";
const NOTIFICATION_CHECK_INTERVAL = 60000; // Check every minute

// In-memory cache
let remindersCache: Reminder[] | null = null;
let notificationCheckInterval: NodeJS.Timeout | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function generateId(): string {
  return `rem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ============ Storage Functions ============

export function loadReminders(): Reminder[] {
  if (!isBrowser()) return [];
  
  if (remindersCache !== null) {
    console.log("[Reminders] Returning cached reminders:", remindersCache.length);
    return remindersCache;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    remindersCache = stored ? JSON.parse(stored) : [];
    console.log("[Reminders] Loaded from localStorage:", remindersCache!.length, "reminders");
    return remindersCache!;
  } catch (e) {
    console.error("[Reminders] Failed to load:", e);
    remindersCache = [];
    return remindersCache;
  }
}

function saveReminders(reminders: Reminder[]): void {
  if (!isBrowser()) return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    remindersCache = reminders;
  } catch (e) {
    console.error("[Reminders] Failed to save:", e);
  }
}

// ============ CRUD Operations ============

export function createReminder(input: ReminderCreateInput): Reminder {
  const reminders = loadReminders();
  
  // Default reminder time is 1 day before due date, or 1 hour if due today
  const dueDate = new Date(input.dueDate);
  const defaultReminderTime = new Date(dueDate);
  const now = new Date();
  
  if (dueDate.getTime() - now.getTime() > 24 * 60 * 60 * 1000) {
    // More than 1 day away - remind 1 day before
    defaultReminderTime.setDate(defaultReminderTime.getDate() - 1);
    defaultReminderTime.setHours(9, 0, 0, 0); // 9 AM
  } else {
    // Due today or tomorrow - remind 1 hour before or immediately
    defaultReminderTime.setTime(Math.max(dueDate.getTime() - 60 * 60 * 1000, now.getTime() + 5 * 60 * 1000));
  }
  
  const reminder: Reminder = {
    id: generateId(),
    caseId: input.caseId,
    title: input.title,
    description: input.description,
    dueDate: dueDate.toISOString(),
    reminderTime: (input.reminderTime || defaultReminderTime).toISOString(),
    priority: input.priority || "medium",
    category: input.category || "follow_up",
    status: "pending",
    createdAt: new Date().toISOString(),
    stepId: input.stepId,
    licenseId: input.licenseId,
  };
  
  reminders.push(reminder);
  saveReminders(reminders);
  
  console.log("[Reminders] Created reminder:", {
    id: reminder.id,
    title: reminder.title,
    caseId: reminder.caseId,
    dueDate: reminder.dueDate,
    reminderTime: reminder.reminderTime,
  });
  console.log("[Reminders] Total reminders in storage:", reminders.length);
  
  return reminder;
}

export function updateReminder(id: string, updates: Partial<Omit<Reminder, "id" | "caseId" | "createdAt">>): Reminder | null {
  const reminders = loadReminders();
  const index = reminders.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  reminders[index] = { ...reminders[index], ...updates };
  saveReminders(reminders);
  
  return reminders[index];
}

export function deleteReminder(id: string): boolean {
  const reminders = loadReminders();
  const index = reminders.findIndex(r => r.id === id);
  
  if (index === -1) return false;
  
  reminders.splice(index, 1);
  saveReminders(reminders);
  
  return true;
}

export function getRemindersByCase(caseId: string): Reminder[] {
  const all = loadReminders();
  const filtered = all.filter(r => r.caseId === caseId);
  console.log(`[Reminders] getRemindersByCase("${caseId}"): ${filtered.length} of ${all.length} total`);
  return filtered;
}

export function getPendingReminders(): Reminder[] {
  return loadReminders().filter(r => r.status === "pending");
}

export function getDueReminders(): Reminder[] {
  const now = new Date();
  return loadReminders().filter(r => 
    r.status === "pending" && 
    new Date(r.reminderTime) <= now
  );
}

// ============ Notification Functions ============

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isBrowser() || !("Notification" in window)) {
    return "denied";
  }
  
  if (Notification.permission === "granted") {
    return "granted";
  }
  
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission;
  }
  
  return Notification.permission;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isBrowser() || !("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
}

export function sendNotification(reminder: Reminder): boolean {
  if (!isBrowser() || !("Notification" in window)) {
    return false;
  }
  
  if (Notification.permission !== "granted") {
    return false;
  }
  
  try {
    const notification = new Notification(`Bureaucracy Breaker: ${reminder.title}`, {
      body: reminder.description,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: reminder.id,
      requireInteraction: reminder.priority === "high",
      data: { reminderId: reminder.id, caseId: reminder.caseId },
    });
    
    notification.onclick = () => {
      window.focus();
      // Navigate to the case
      window.location.href = `/history/${reminder.caseId}`;
      notification.close();
    };
    
    // Update reminder status
    updateReminder(reminder.id, { status: "sent" });
    
    return true;
  } catch (e) {
    console.error("[Reminders] Failed to send notification:", e);
    return false;
  }
}

// ============ Auto-check for due reminders ============

export function startReminderChecks(): void {
  if (!isBrowser()) return;
  
  if (notificationCheckInterval) {
    clearInterval(notificationCheckInterval);
  }
  
  // Check immediately
  checkAndSendDueReminders();
  
  // Then check every minute
  notificationCheckInterval = setInterval(checkAndSendDueReminders, NOTIFICATION_CHECK_INTERVAL);
}

export function stopReminderChecks(): void {
  if (notificationCheckInterval) {
    clearInterval(notificationCheckInterval);
    notificationCheckInterval = null;
  }
}

export function checkAndSendDueReminders(): number {
  const dueReminders = getDueReminders();
  let sentCount = 0;
  
  console.log(`[Reminders] Checking... Found ${dueReminders.length} due reminders`);
  
  for (const reminder of dueReminders) {
    console.log(`[Reminders] Sending notification for: ${reminder.title}`);
    if (sendNotification(reminder)) {
      sentCount++;
    }
  }
  
  return sentCount;
}

// Test notification manually
export function sendTestNotification(): { success: boolean; message: string } {
  console.log("[Reminders] Testing notification...");
  console.log("[Reminders] Browser:", isBrowser());
  console.log("[Reminders] Notification API:", "Notification" in window);
  console.log("[Reminders] Permission:", typeof Notification !== "undefined" ? Notification.permission : "N/A");
  
  if (!isBrowser()) {
    return { success: false, message: "Not running in browser" };
  }
  
  if (!("Notification" in window)) {
    return { success: false, message: "Notification API not supported in this browser" };
  }
  
  if (Notification.permission === "denied") {
    return { success: false, message: "Notifications blocked. Check browser settings (click lock icon in address bar)" };
  }
  
  if (Notification.permission !== "granted") {
    return { success: false, message: `Permission is "${Notification.permission}". Click Enable Notifications first.` };
  }
  
  try {
    const notification = new Notification("Bureaucracy Breaker", {
      body: "Test notification - if you see this, notifications work!",
      icon: "/favicon.ico",
      tag: "test-notification",
      requireInteraction: true, // Keep it visible until user interacts
    });
    
    notification.onclick = () => {
      console.log("[Reminders] Test notification clicked");
      notification.close();
    };
    
    notification.onshow = () => {
      console.log("[Reminders] Test notification shown");
    };
    
    notification.onerror = (e) => {
      console.error("[Reminders] Test notification error:", e);
    };
    
    console.log("[Reminders] Test notification created:", notification);
    return { success: true, message: "Notification sent! Check your system notifications." };
  } catch (e) {
    console.error("[Reminders] Failed to send test notification:", e);
    return { success: false, message: `Error: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ============ Auto-generate reminders from timeline ============

export interface TimelineStep {
  id: string;
  title: string;
  eta: string;
  owner: string;
  daysMin?: number;
  daysMax?: number;
}

export function generateRemindersFromTimeline(
  caseId: string,
  steps: TimelineStep[],
  startDate: Date = new Date()
): Reminder[] {
  const existingReminders = getRemindersByCase(caseId);
  const existingStepIds = new Set(existingReminders.filter(r => r.stepId).map(r => r.stepId));
  
  const newReminders: Reminder[] = [];
  let cumulativeDays = 0;
  
  for (const step of steps) {
    // Skip if reminder already exists for this step
    if (existingStepIds.has(step.id)) continue;
    
    // Parse ETA (e.g., "7-14 days" or "10 days")
    const etaMatch = step.eta.match(/(\d+)(?:-(\d+))?\s*days?/i);
    const daysMin = etaMatch ? parseInt(etaMatch[1]) : 7;
    const daysMax = etaMatch && etaMatch[2] ? parseInt(etaMatch[2]) : daysMin;
    const avgDays = Math.round((daysMin + daysMax) / 2);
    
    // Calculate due date from start
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + cumulativeDays + avgDays);
    
    // Create reminder
    const reminder = createReminder({
      caseId,
      title: `Follow up: ${step.title}`,
      description: `Check status of "${step.title}" - Expected completion around this time (${step.eta})`,
      dueDate,
      priority: cumulativeDays === 0 ? "high" : "medium",
      category: "follow_up",
      stepId: step.id,
    });
    
    newReminders.push(reminder);
    cumulativeDays += avgDays;
  }
  
  return newReminders;
}

// ============ Quick reminder presets ============

export function createQuickReminder(
  caseId: string,
  preset: "today" | "tomorrow" | "in_3_days" | "in_week" | "in_month",
  title: string,
  description: string
): Reminder {
  const dueDate = new Date();
  
  switch (preset) {
    case "today":
      // Keep today's date
      break;
    case "tomorrow":
      dueDate.setDate(dueDate.getDate() + 1);
      break;
    case "in_3_days":
      dueDate.setDate(dueDate.getDate() + 3);
      break;
    case "in_week":
      dueDate.setDate(dueDate.getDate() + 7);
      break;
    case "in_month":
      dueDate.setMonth(dueDate.getMonth() + 1);
      break;
  }
  
  // For today, set reminder time to 2 minutes from now for quick testing
  const reminderTime = new Date();
  if (preset === "today") {
    reminderTime.setMinutes(reminderTime.getMinutes() + 2); // 2 minutes from now
    dueDate.setHours(reminderTime.getHours(), reminderTime.getMinutes(), 0, 0);
  } else {
    dueDate.setHours(10, 0, 0, 0);
    reminderTime.setTime(dueDate.getTime());
    reminderTime.setHours(9, 0, 0, 0); // Remind at 9 AM
  }
  
  return createReminder({
    caseId,
    title,
    description,
    dueDate,
    reminderTime,
    category: "custom",
  });
}

// ============ Format helpers ============

export function formatReminderDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  if (days < 0) {
    return `${Math.abs(days)} days overdue`;
  } else if (days === 0) {
    return "Due today";
  } else if (days === 1) {
    return "Due tomorrow";
  } else if (days < 7) {
    return `Due in ${days} days`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `Due in ${weeks} week${weeks > 1 ? "s" : ""}`;
  } else {
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }
}

export function formatReminderTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default {
  loadReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  getRemindersByCase,
  getPendingReminders,
  getDueReminders,
  requestNotificationPermission,
  getNotificationPermission,
  sendNotification,
  sendTestNotification,
  startReminderChecks,
  stopReminderChecks,
  checkAndSendDueReminders,
  generateRemindersFromTimeline,
  createQuickReminder,
  formatReminderDate,
  formatReminderTime,
};
