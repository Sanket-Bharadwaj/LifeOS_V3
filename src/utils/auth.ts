
// Authentication utilities for LifeOS
// In a real mobile app, this would use SQLite and SecureStore from Expo
// For this web demo, we'll use localStorage with simulated encryption

interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

// Simple hashing function (for demo purposes)
// In a real app, use a proper crypto library
const hashPassword = (password: string): string => {
  return btoa(password.split('').reverse().join('')); // Simulated hash - NOT secure
};

// Check if hash matches password
const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

// Get current user session
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('lifeos_current_user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (e) {
    console.error('Error parsing user session', e);
    return null;
  }
};

// Login a user
export const loginUser = (email: string, password: string): User | null => {
  // Get all users
  const usersJson = localStorage.getItem('lifeos_users');
  if (!usersJson) return null;
  
  try {
    const users: User[] = JSON.parse(usersJson);
    const user = users.find(u => u.email === email);
    
    if (!user) return null;
    if (!verifyPassword(password, user.passwordHash)) return null;
    
    // Store current user session
    const sessionUser = { ...user };
    delete (sessionUser as any).passwordHash; // Don't keep password hash in session
    localStorage.setItem('lifeos_current_user', JSON.stringify(user));
    
    return user;
  } catch (e) {
    console.error('Error during login', e);
    return null;
  }
};

// Register a new user
export const registerUser = (name: string, email: string, password: string): User | null => {
  // Check if email already exists
  const usersJson = localStorage.getItem('lifeos_users');
  let users: User[] = [];
  
  if (usersJson) {
    try {
      users = JSON.parse(usersJson);
      if (users.some(u => u.email === email)) {
        console.error('Email already registered');
        return null;
      }
    } catch (e) {
      console.error('Error parsing users', e);
      // Continue with empty users array
    }
  }
  
  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
    passwordHash: hashPassword(password),
  };
  
  // Add to users and save
  users.push(newUser);
  localStorage.setItem('lifeos_users', JSON.stringify(users));
  
  // Create session
  const sessionUser = { ...newUser };
  delete (sessionUser as any).passwordHash; // Don't keep password hash in session
  localStorage.setItem('lifeos_current_user', JSON.stringify(newUser));
  
  return newUser;
};

// Logout
export const logoutUser = (): void => {
  localStorage.removeItem('lifeos_current_user');
};

// Update user profile
export const updateUserProfile = (userId: string, updates: { name?: string, email?: string, password?: string }): boolean => {
  const usersJson = localStorage.getItem('lifeos_users');
  if (!usersJson) return false;
  
  try {
    const users: User[] = JSON.parse(usersJson);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return false;
    
    // Update fields
    if (updates.name) users[userIndex].name = updates.name;
    if (updates.email) users[userIndex].email = updates.email;
    if (updates.password) users[userIndex].passwordHash = hashPassword(updates.password);
    
    // Save updated users
    localStorage.setItem('lifeos_users', JSON.stringify(users));
    
    // Update current session if it's this user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...users[userIndex] };
      delete (updatedUser as any).passwordHash;
      localStorage.setItem('lifeos_current_user', JSON.stringify(updatedUser));
    }
    
    return true;
  } catch (e) {
    console.error('Error updating user profile', e);
    return false;
  }
};
