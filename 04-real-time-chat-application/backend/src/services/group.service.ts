import {
  chatStore,
  ChatConversation,
  ChatMember,
  MemberRole
} from './store.service';

export class GroupService {
  /**
   * Creates a new group conversation with the creator as OWNER.
   */
  public static createGroup(
    creatorId: string,
    title: string,
    memberUserIds: string[] = []
  ): ChatConversation {
    const convId = 'conv_' + Math.random().toString(36).substring(2, 9);
    const conversation: ChatConversation = {
      id: convId,
      type: 'GROUP',
      title: title.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    chatStore.conversations.push(conversation);

    // Add creator as OWNER
    chatStore.members.push({
      id: 'mem_' + Math.random().toString(36).substring(2, 9),
      conversationId: convId,
      userId: creatorId,
      role: 'OWNER',
      joinedAt: new Date()
    });

    // Add initial members as MEMBER
    for (const uid of memberUserIds) {
      if (uid !== creatorId) {
        chatStore.members.push({
          id: 'mem_' + Math.random().toString(36).substring(2, 9),
          conversationId: convId,
          userId: uid,
          role: 'MEMBER',
          joinedAt: new Date()
        });
      }
    }

    return conversation;
  }

  /**
   * Checks if user has permission to manage group (OWNER or ADMIN).
   */
  public static isManager(conversationId: string, userId: string): boolean {
    const member = chatStore.members.find(
      m => m.conversationId === conversationId && m.userId === userId
    );
    return member ? member.role === 'OWNER' || member.role === 'ADMIN' : false;
  }

  /**
   * Checks if user is the OWNER.
   */
  public static isOwner(conversationId: string, userId: string): boolean {
    const member = chatStore.members.find(
      m => m.conversationId === conversationId && m.userId === userId
    );
    return member ? member.role === 'OWNER' : false;
  }

  /**
   * Adds a member to the group (Admin or Owner only).
   */
  public static addMember(
    conversationId: string,
    operatorUserId: string,
    targetUserId: string,
    role: MemberRole = 'MEMBER'
  ): ChatMember {
    if (!this.isManager(conversationId, operatorUserId)) {
      throw new Error('Unauthorized: Only group owner or admins can add members');
    }

    const existing = chatStore.members.find(
      m => m.conversationId === conversationId && m.userId === targetUserId
    );
    if (existing) {
      return existing;
    }

    const member: ChatMember = {
      id: 'mem_' + Math.random().toString(36).substring(2, 9),
      conversationId,
      userId: targetUserId,
      role,
      joinedAt: new Date()
    };
    chatStore.members.push(member);
    return member;
  }

  /**
   * Removes a member from group (Admin/Owner removing member, or member self-leaving).
   */
  public static removeMember(
    conversationId: string,
    operatorUserId: string,
    targetUserId: string
  ): boolean {
    const isSelf = operatorUserId === targetUserId;
    const isAuthorized = this.isManager(conversationId, operatorUserId);

    if (!isSelf && !isAuthorized) {
      throw new Error('Unauthorized: Only group owner or admins can remove members');
    }

    // Owner cannot be removed by admins
    if (!isSelf && this.isOwner(conversationId, targetUserId)) {
      throw new Error('Forbidden: The group owner cannot be removed');
    }

    const idx = chatStore.members.findIndex(
      m => m.conversationId === conversationId && m.userId === targetUserId
    );

    if (idx !== -1) {
      chatStore.members.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Updates a member's role (Owner only).
   */
  public static updateRole(
    conversationId: string,
    operatorUserId: string,
    targetUserId: string,
    newRole: MemberRole
  ): ChatMember {
    if (!this.isOwner(conversationId, operatorUserId)) {
      throw new Error('Unauthorized: Only the group owner can change member roles');
    }

    const member = chatStore.members.find(
      m => m.conversationId === conversationId && m.userId === targetUserId
    );
    if (!member) {
      throw new Error('Member not found in conversation');
    }

    if (newRole === 'OWNER') {
      return this.transferOwnership(conversationId, operatorUserId, targetUserId);
    }

    member.role = newRole;
    return member;
  }

  /**
   * Transfers group ownership from current owner to another member.
   */
  public static transferOwnership(
    conversationId: string,
    currentOwnerId: string,
    newOwnerId: string
  ): ChatMember {
    if (!this.isOwner(conversationId, currentOwnerId)) {
      throw new Error('Unauthorized: Only the current owner can transfer ownership');
    }

    const targetMember = chatStore.members.find(
      m => m.conversationId === conversationId && m.userId === newOwnerId
    );
    if (!targetMember) {
      throw new Error('Target user is not a member of this conversation');
    }

    const currentOwnerMember = chatStore.members.find(
      m => m.conversationId === conversationId && m.userId === currentOwnerId
    )!;

    currentOwnerMember.role = 'ADMIN';
    targetMember.role = 'OWNER';

    return targetMember;
  }
}
