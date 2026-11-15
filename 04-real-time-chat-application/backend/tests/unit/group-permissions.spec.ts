import { GroupService } from '../../src/services/group.service';
import { chatStore } from '../../src/services/store.service';

describe('GroupService Roles & Permissions', () => {
  beforeEach(() => {
    chatStore.clear();
  });

  it('should initialize creator as OWNER of group conversation', () => {
    const group = GroupService.createGroup('usr_alice', 'Tech Discussion', ['usr_bob']);
    const members = chatStore.members.filter(m => m.conversationId === group.id);

    expect(members.length).toBe(2);
    expect(members.find(m => m.userId === 'usr_alice')?.role).toBe('OWNER');
    expect(members.find(m => m.userId === 'usr_bob')?.role).toBe('MEMBER');
  });

  it('should allow OWNER to add members and promote to ADMIN', () => {
    const group = GroupService.createGroup('usr_alice', 'Designers', []);

    // Alice adds Bob
    const bob = GroupService.addMember(group.id, 'usr_alice', 'usr_bob');
    expect(bob.role).toBe('MEMBER');

    // Alice promotes Bob to ADMIN
    const promotedBob = GroupService.updateRole(group.id, 'usr_alice', 'usr_bob', 'ADMIN');
    expect(promotedBob.role).toBe('ADMIN');
  });

  it('should deny normal MEMBER from adding or removing members', () => {
    const group = GroupService.createGroup('usr_alice', 'Gamers', ['usr_bob', 'usr_charlie']);

    // Bob (regular member) attempts to add David
    expect(() => GroupService.addMember(group.id, 'usr_bob', 'usr_david')).toThrow('Unauthorized');

    // Bob attempts to remove Charlie
    expect(() => GroupService.removeMember(group.id, 'usr_bob', 'usr_charlie')).toThrow('Unauthorized');
  });

  it('should allow ADMIN to remove MEMBER but disallow ADMIN from removing OWNER', () => {
    const group = GroupService.createGroup('usr_alice', 'Admins Chat', ['usr_bob', 'usr_charlie']);
    GroupService.updateRole(group.id, 'usr_alice', 'usr_bob', 'ADMIN');

    // Bob (Admin) removes Charlie (Member) -> Allowed
    const removed = GroupService.removeMember(group.id, 'usr_bob', 'usr_charlie');
    expect(removed).toBe(true);

    // Bob (Admin) attempts to remove Alice (Owner) -> Denied
    expect(() => GroupService.removeMember(group.id, 'usr_bob', 'usr_alice')).toThrow('Forbidden');
  });

  it('should transfer ownership properly', () => {
    const group = GroupService.createGroup('usr_alice', 'Book Club', ['usr_bob']);

    GroupService.transferOwnership(group.id, 'usr_alice', 'usr_bob');

    const aliceMember = chatStore.members.find(m => m.conversationId === group.id && m.userId === 'usr_alice');
    const bobMember = chatStore.members.find(m => m.conversationId === group.id && m.userId === 'usr_bob');

    expect(aliceMember?.role).toBe('ADMIN');
    expect(bobMember?.role).toBe('OWNER');
  });
});
