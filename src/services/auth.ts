/**
 * Authentication Service
 * The Gym Fitness Club CRM & HR System
 */

import { db, UserRecord } from './db';

const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(email: string, passwordHash: string): Promise<UserRecord> {
    await delay(300);
    const users = db.getCollection<UserRecord>('gym_users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (user.passwordHash !== passwordHash) {
      throw new Error('Invalid email or password.');
    }

    if (user.status === 'suspended') {
      throw new Error('Account suspended. Please contact the administrator.');
    }

    // Dynamically initialize coach profile on login if missing
    if (user.role === 'coach' && user.entityId) {
      const coaches = db.getCollection<any>('gym_coaches');
      const exists = coaches.some((c: any) => c.id === user.entityId);
      if (!exists) {
        coaches.push({
          id: user.entityId,
          name: 'Coach Marcus Sterling',
          email: user.email,
          phone: '+1 (555) 019-1111',
          specialization: 'Barbell Strength & CrossFit',
          role: 'personal_trainer',
          status: 'active',
          hireDate: '2026-01-10',
          activeClientsCount: 0,
          experienceYears: 12,
          bio: 'Former competitive powerlifter with 12+ years coaching. Expert in barbell compound lift adjustments.',
          profilePic: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=150&h=150'
        });
        db.saveCollection('gym_coaches', coaches);
      }
    }

    // Store session
    db.setItem('gym_current_user', user);
    db.setItem('gym_auth_token', `mock_token_${Date.now()}`);

    return user;
  },

  async logout(): Promise<void> {
    await delay(100);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gym_current_user');
      localStorage.removeItem('gym_auth_token');
    }
  },

  getCurrentUser(): UserRecord | null {
    return db.getItem<UserRecord>('gym_current_user');
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await delay(200);
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('No user authenticated.');

    const users = db.getCollection<UserRecord>('gym_users');
    const userIdx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());

    if (userIdx === -1) throw new Error('User not found.');
    if (users[userIdx].passwordHash !== oldPassword) {
      throw new Error('Incorrect current password.');
    }

    // Update
    users[userIdx].passwordHash = newPassword;
    if (users[userIdx].forcePasswordReset) {
      users[userIdx].forcePasswordReset = false;
    }
    db.saveCollection('gym_users', users);

    // Update session
    currentUser.passwordHash = newPassword;
    currentUser.forcePasswordReset = false;
    db.setItem('gym_current_user', currentUser);
  },

  async createUserAccount(email: string, passwordHash: string, role: UserRecord['role'], entityId?: string): Promise<UserRecord> {
    await delay(150);
    const users = db.getCollection<UserRecord>('gym_users');
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User account already exists.');
    }

    const newUser: UserRecord = {
      email,
      passwordHash,
      role,
      entityId,
      status: 'active'
    };

    users.push(newUser);
    db.saveCollection('gym_users', users);
    return newUser;
  },

  async resetPassword(email: string, newPassword: string): Promise<void> {
    await delay(150);
    const users = db.getCollection<UserRecord>('gym_users');
    const userIdx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIdx === -1) throw new Error('User not found.');
    users[userIdx].passwordHash = newPassword;
    users[userIdx].forcePasswordReset = true;
    db.saveCollection('gym_users', users);
  },

  async suspendUser(email: string): Promise<void> {
    await delay(100);
    // Hardening: Super Admin cannot be suspended
    if (email.toLowerCase() === 'gowtham@thegymfitnesshub.in') {
      throw new Error('Super Admin account cannot be suspended.');
    }

    const users = db.getCollection<UserRecord>('gym_users');
    const userIdx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIdx === -1) throw new Error('User not found.');
    users[userIdx].status = 'suspended';
    db.saveCollection('gym_users', users);

    // Terminate active session if it's the suspended user
    const cur = this.getCurrentUser();
    if (cur && cur.email.toLowerCase() === email.toLowerCase()) {
      await this.logout();
    }
  },

  async activateUser(email: string): Promise<void> {
    await delay(100);
    const users = db.getCollection<UserRecord>('gym_users');
    const userIdx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIdx === -1) throw new Error('User not found.');
    users[userIdx].status = 'active';
    db.saveCollection('gym_users', users);
  }
};
