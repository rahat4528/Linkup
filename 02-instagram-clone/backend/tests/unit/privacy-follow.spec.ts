import { PrivacyService } from '../../src/services/privacy.service';
import { instaStore } from '../../src/services/store.service';

describe('PrivacyService — Follow Request State Machine & Access Gating', () => {
  const publicUser = 'user_public';
  const privateUser = 'user_private';
  const followerUser = 'user_follower';

  beforeEach(() => {
    instaStore.clear();

    // Setup public account
    instaStore.users.push({
      id: publicUser,
      email: 'public@example.com',
      username: 'publiccreator',
      passwordHash: 'hash',
      name: 'Public Creator',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    instaStore.profiles.push({
      id: 'prof_pub',
      userId: publicUser,
      isPrivate: false,
      isVerified: false,
    });

    // Setup private account
    instaStore.users.push({
      id: privateUser,
      email: 'private@example.com',
      username: 'privatecreator',
      passwordHash: 'hash',
      name: 'Private Creator',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    instaStore.profiles.push({
      id: 'prof_priv',
      userId: privateUser,
      isPrivate: true,
      isVerified: false,
    });
  });

  it('following a public account establishes immediate direct follow (ACCEPTED)', () => {
    const res = PrivacyService.followUser(followerUser, publicUser);
    expect(res.status).toBe('ACCEPTED');
    expect(res.follow).toBeDefined();
    expect(PrivacyService.isFollowing(followerUser, publicUser)).toBe(true);
    expect(PrivacyService.canViewContent(followerUser, publicUser)).toBe(true);
  });

  it('following a private account creates a PENDING request and gates content', () => {
    // Before follow request
    expect(PrivacyService.canViewContent(followerUser, privateUser)).toBe(false);

    // Send follow request
    const res = PrivacyService.followUser(followerUser, privateUser);
    expect(res.status).toBe('PENDING');
    expect(res.request).toBeDefined();
    expect(PrivacyService.isFollowing(followerUser, privateUser)).toBe(false);

    // Content remains locked while request is pending
    expect(PrivacyService.canViewContent(followerUser, privateUser)).toBe(false);

    // Private user approves request
    PrivacyService.approveFollowRequest(res.request!.id, privateUser);

    // Now follower has approved access
    expect(PrivacyService.isFollowing(followerUser, privateUser)).toBe(true);
    expect(PrivacyService.canViewContent(followerUser, privateUser)).toBe(true);
  });
});
