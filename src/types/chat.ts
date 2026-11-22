export type UserRole = 'owner' | 'superadmin' | 'admin' | 'moderator' | 'vip' | 'user'

export interface UserPermissions {
  canSeeAllUsers: boolean
  canSendSystemMessages: boolean
  canManageRoles: boolean
  canUseStealth: boolean
  hasImmunity: boolean
  canManageCinephile: boolean
}

export interface FeaturedCinephileConfig {
  cinephileUid: string
  cinephileName: string
  updatedAt: number
  updatedBy: string
}

export interface UserProfile {
  uid: string
  displayName: string
  displayNameLower: string
  email: string
  role: UserRole
  permissions: UserPermissions
  isOnline: boolean
  hideOnline: boolean
  lastSeen: number
  createdAt: number
  updatedAt?: number
  isBlocked?: boolean
  isDeleted?: boolean
  blockedUsers?: string[]
}

export interface FriendshipItem {
  id: string
  users: [string, string]
  requesterId: string
  status: 'pending' | 'accepted'
  createdAt: number
}

export interface SharedMediaCard {
  id: number
  media_type: 'movie' | 'tv'
  title: string
  poster_path?: string
  release_date?: string
  vote_average?: number
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderRole: UserRole
  text: string
  mediaCard?: SharedMediaCard
  isSystem?: boolean
  isAnonymous?: boolean
  deletedFor: string[]
  readBy: string[]
  createdAt: number
  editedAt?: number
}

export interface ChatRoom {
  id: string
  participants: string[]
  isGroup?: boolean
  groupTitle?: string
  lastMessage: string
  lastSenderId: string
  updatedAt: number
  unreadCount: Record<string, number>
  typing?: Record<string, boolean>
  clearedAt?: Record<string, number>
}

export interface SystemNotificationItem {
  id: string
  type: 'admin_notice' | 'friend_accepted' | 'media_recommendation'
  title: string
  text: string
  senderName?: string
  senderRole?: UserRole
  isAnonymous?: boolean
  mediaCard?: SharedMediaCard
  isRead: boolean
  createdAt: number
}
