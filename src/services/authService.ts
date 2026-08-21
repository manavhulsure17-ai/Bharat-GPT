import { AppUser, AdminCredentials, IndicLanguageCode } from "../types";

const USERS_STORAGE_KEY = "bharat_gpt_registered_users_v1";
const ADMIN_STORAGE_KEY = "bharat_gpt_admin_creds_v1";
const SESSION_STORAGE_KEY = "bharat_gpt_current_session_v1";
const LANGUAGE_STORAGE_KEY = "bharat_gpt_lang";

const DEFAULT_ADMIN_CONFIG: AdminCredentials = {
  email: "manavhulsure80@gmail.com",
  password: "Bharatgpt@sarm",
  updatedAt: new Date().toISOString(),
};

/**
 * Retrieves the preferred language from session profile or local storage fallback
 */
export function getSavedLanguagePreference(): IndicLanguageCode {
  try {
    const session = getCurrentUser();
    if (session && session.preferredLanguage) {
      return session.preferredLanguage;
    }
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored) {
      return stored as IndicLanguageCode;
    }
  } catch (e) {
    console.error("Error reading saved language preference", e);
  }
  return "English";
}

/**
 * Updates the user's preferred language in the profile database, session, and local storage
 */
export function updateUserPreferredLanguage(userId: string | undefined, language: IndicLanguageCode): AppUser | null {
  // Always update local storage key as persistent fallback
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (e) {
    console.error("Error updating language in localStorage", e);
  }

  const currentSession = getCurrentUser();

  // If no user ID is provided, just return or update current session if exists
  if (!userId) {
    if (currentSession) {
      const updatedSession: AppUser = {
        ...currentSession,
        preferredLanguage: language,
      };
      saveSession(updatedSession);
      return updatedSession;
    }
    return null;
  }

  // Handle Admin User Profile
  if (userId === "admin-root" || (currentSession && currentSession.role === "admin" && currentSession.id === userId)) {
    const updatedAdmin: AppUser = {
      ...(currentSession || {
        id: "admin-root",
        name: "Manav Hulsure (Super Admin)",
        email: getAdminCredentials().email,
        passwordHash: getAdminCredentials().password,
        role: "admin",
        createdAt: "2026-01-01T00:00:00.000Z",
        lastLoginAt: new Date().toISOString(),
      }),
      preferredLanguage: language,
    };
    saveSession(updatedAdmin);
    return updatedAdmin;
  }

  // Handle Regular Registered User Profile
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    const updatedUser: AppUser = {
      ...users[index],
      preferredLanguage: language,
    };
    users[index] = updatedUser;
    saveUsers(users);

    if (currentSession && currentSession.id === userId) {
      saveSession(updatedUser);
    }
    return updatedUser;
  }

  if (currentSession && currentSession.id === userId) {
    const updatedSession: AppUser = {
      ...currentSession,
      preferredLanguage: language,
    };
    saveSession(updatedSession);
    return updatedSession;
  }

  return currentSession;
}

/**
 * Retrieves the current Admin credentials (with fallback to default)
 */
export function getAdminCredentials(): AdminCredentials {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email && parsed.password) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading admin credentials", e);
  }
  return DEFAULT_ADMIN_CONFIG;
}

/**
 * Updates Admin email and password
 */
export function updateAdminCredentials(newEmail: string, newPass: string): AdminCredentials {
  const trimmedEmail = newEmail.trim().toLowerCase();
  const trimmedPass = newPass.trim();

  if (!trimmedEmail || !trimmedEmail.includes("@")) {
    throw new Error("Please provide a valid email address for Admin.");
  }
  if (!trimmedPass || trimmedPass.length < 6) {
    throw new Error("Password / PIN must be at least 6 characters or digits.");
  }

  const updated: AdminCredentials = {
    email: trimmedEmail,
    password: trimmedPass,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(updated));

  // Also update session user if currently logged in as admin
  const currentSession = getCurrentUser();
  if (currentSession && currentSession.role === "admin") {
    const updatedAdminUser: AppUser = {
      ...currentSession,
      email: trimmedEmail,
      passwordHash: trimmedPass,
    };
    saveSession(updatedAdminUser);
  }

  return updated;
}

/**
 * Retrieves all registered users
 */
export function getAllUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error loading users database", e);
  }
  return [];
}

/**
 * Saves users list
 */
function saveUsers(users: AppUser[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

/**
 * Registers a new user
 */
export function registerUser(name: string, email: string, pinOrPassword: string): AppUser {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPass = pinOrPassword.trim();

  if (!trimmedName) {
    throw new Error("Please enter your full name.");
  }
  if (!trimmedEmail || !trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
    throw new Error("Please enter a valid Google / email address.");
  }
  if (!trimmedPass || trimmedPass.length < 6) {
    throw new Error("Password / PIN must be at least 6 characters or digits long.");
  }

  const adminCreds = getAdminCredentials();
  const isAdminEmail = trimmedEmail === adminCreds.email.toLowerCase();

  // If registering with admin email, must match admin credentials
  if (isAdminEmail) {
    if (trimmedPass !== adminCreds.password) {
      throw new Error("This email is designated as Super Admin. Please enter the correct Admin Master Password.");
    }
    const currentLang = getSavedLanguagePreference();
    const adminUser: AppUser = {
      id: "admin-root",
      name: trimmedName || "Super Admin",
      email: trimmedEmail,
      passwordHash: trimmedPass,
      role: "admin",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      preferredLanguage: currentLang,
    };
    saveSession(adminUser);
    return adminUser;
  }

  const existingUsers = getAllUsers();
  const userExists = existingUsers.some(
    (u) => u.email.toLowerCase() === trimmedEmail
  );

  if (userExists) {
    throw new Error("An account with this email already exists. Please sign in instead.");
  }

  const initialLang = getSavedLanguagePreference();
  const newUser: AppUser = {
    id: "user-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6),
    name: trimmedName,
    email: trimmedEmail,
    passwordHash: trimmedPass,
    role: "user",
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    preferredLanguage: initialLang,
  };

  const updatedUsers = [newUser, ...existingUsers];
  saveUsers(updatedUsers);
  saveSession(newUser);
  return newUser;
}

/**
 * Logs in an existing user or admin
 */
export function loginUser(emailOrName: string, pinOrPassword: string): AppUser {
  const query = emailOrName.trim().toLowerCase();
  const pass = pinOrPassword.trim();

  if (!query) {
    throw new Error("Please enter your email address or name.");
  }
  if (!pass) {
    throw new Error("Please enter your password / PIN.");
  }

  const adminCreds = getAdminCredentials();

  // Check Admin Login Match
  if (
    query === adminCreds.email.toLowerCase() ||
    query === "admin" ||
    query === "manav hulsure"
  ) {
    if (pass === adminCreds.password) {
      const activeLang = getSavedLanguagePreference();
      const adminUser: AppUser = {
        id: "admin-root",
        name: "Manav Hulsure (Super Admin)",
        email: adminCreds.email,
        passwordHash: adminCreds.password,
        role: "admin",
        createdAt: "2026-01-01T00:00:00.000Z",
        lastLoginAt: new Date().toISOString(),
        preferredLanguage: activeLang,
      };
      saveSession(adminUser);
      return adminUser;
    }
  }

  // Check Regular Users List
  const users = getAllUsers();
  const matchedUser = users.find(
    (u) =>
      (u.email.toLowerCase() === query || u.name.toLowerCase() === query) &&
      u.passwordHash === pass
  );

  if (!matchedUser) {
    // Check if user exists with wrong password
    const userWithEmail = users.find((u) => u.email.toLowerCase() === query || u.name.toLowerCase() === query);
    if (userWithEmail) {
      throw new Error("Incorrect Password or PIN. Please try again.");
    }
    throw new Error("Account not found. Please verify your credentials or click 'Create Account'.");
  }

  // Sync saved language preference from profile to local storage fallback
  const userLang = matchedUser.preferredLanguage || getSavedLanguagePreference();
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, userLang);
  } catch (e) {
    console.error(e);
  }

  // Update last login & ensure preferredLanguage is set
  const updatedUser: AppUser = {
    ...matchedUser,
    preferredLanguage: userLang,
    lastLoginAt: new Date().toISOString(),
  };
  const updatedUsers = users.map((u) => (u.id === matchedUser.id ? updatedUser : u));
  saveUsers(updatedUsers);
  saveSession(updatedUser);
  return updatedUser;
}

/**
 * Saves current authenticated session
 */
export function saveSession(user: AppUser): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

/**
 * Retrieves current active user session
 */
export function getCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.email) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading session", e);
  }
  return null;
}

/**
 * Logs out the active user
 */
export function logoutUser(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

/**
 * Admin action: Delete a registered user
 */
export function deleteUserByAdmin(userId: string): AppUser[] {
  const users = getAllUsers();
  const filtered = users.filter((u) => u.id !== userId);
  saveUsers(filtered);
  return filtered;
}
