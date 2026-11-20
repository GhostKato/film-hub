import type { UserPermissions, UserRole } from '@/types/chat'
import { MAIN_ACCOUNT_ID } from '@/constants/env'

export const getDefaultPermissions = (role: UserRole): UserPermissions => {
  switch (role) {
    case 'owner':
      return {
        canSeeAllUsers: true,
        canSendSystemMessages: true,
        canManageRoles: true,
        canUseStealth: true,
      }
    case 'admin':
      return {
        canSeeAllUsers: true,
        canSendSystemMessages: true,
        canManageRoles: true,
        canUseStealth: true,
      }
    case 'moderator':
      return {
        canSeeAllUsers: true,
        canSendSystemMessages: true,
        canManageRoles: false,
        canUseStealth: false,
      }
    default:
      return {
        canSeeAllUsers: false,
        canSendSystemMessages: false,
        canManageRoles: false,
        canUseStealth: false,
      }
  }
}

export const resolveInitialRole = (uid: string): UserRole => {
  return uid === MAIN_ACCOUNT_ID ? 'owner' : 'user'
}

export const getDaysOnSite = (createdAt?: number): number => {
  if (!createdAt) return 1
  const diffMs = Date.now() - createdAt
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return days < 1 ? 1 : days
}

export const getChatId = (uid1: string, uid2: string): string => {
  return [uid1, uid2].sort().join('_')
}
