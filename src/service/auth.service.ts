import {
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  sendEmailVerification,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

export interface ProfileUpdateData {
  email?: string;
  displayName?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

// Reset password (forgot password flow)
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Update password (when user is logged in)
export const changePassword = async (data: PasswordChangeData): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('No authenticated user found');
  }

  try {
    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, data.newPassword);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Update email
export const changeEmail = async (newEmail: string, currentPassword: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('No authenticated user found');
  }

  try {
    // Re-authenticate user before changing email
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update email
    await updateEmail(user, newEmail);

    // Send verification email to new address
    await sendEmailVerification(user);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Send email verification
export const sendVerificationEmail = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user found');
  }

  try {
    await sendEmailVerification(user);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Delete user account
export const deleteUserAccount = async (currentPassword: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('No authenticated user found');
  }

  try {
    // Re-authenticate user before deleting account
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Delete user account
    await deleteUser(user);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Get user profile info
export const getUserProfile = (): User | null => {
  return auth.currentUser;
};

// Helper function to get user-friendly error messages
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'code' in error) {
    const firebaseError = error as { code: string; message: string };

    switch (firebaseError.code) {
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Current password is incorrect';
      case 'auth/email-already-in-use':
        return 'Email address is already in use by another account';
      case 'auth/invalid-email':
        return 'Email address is invalid';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/requires-recent-login':
        return 'This operation requires recent authentication. Please log out and log in again';
      default:
        return firebaseError.message || 'An unexpected error occurred';
    }
  }
  return 'An unexpected error occurred';
};
