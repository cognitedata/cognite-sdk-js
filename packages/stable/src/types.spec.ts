// Copyright 2024 Cognite AS
import { Group, isManagedInCDFGroup, isManagedExternallyGroup } from './types';

describe('group types', () => {
  describe('isManagedInCDFGroup', () => {
    it('should return true for a group with members', () => {
      const userListGroup: Group = {
        id: 0,
        isDeleted: false,
        name: 'test-group',
        members: ['a', 'b'],
      };
      const allUserGroup: Group = {
        id: 0,
        isDeleted: false,
        name: 'test-group',
        members: 'allUserAccounts',
      };
      expect(isManagedInCDFGroup(userListGroup)).toBe(true);
      expect(isManagedInCDFGroup(allUserGroup)).toBe(true);
    });

    it('should return false for a group without members', () => {
      const group: Group = {
        id: 0,
        isDeleted: false,
        name: 'test-group',
      };
      expect(isManagedInCDFGroup(group)).toBe(false);
    });
  });

  describe('isManagedExternallyGroup', () => {
    it('should return true for a group without members', () => {
      const group: Group = {
        id: 0,
        isDeleted: false,
        name: 'test-group',
      };
      expect(isManagedExternallyGroup(group)).toBe(true);
    });

    it('should return false for a group with members', () => {
      const group: Group = {
        id: 0,
        isDeleted: false,
        name: 'test-group',
        members: ['a', 'b'],
      };
      expect(isManagedExternallyGroup(group)).toBe(false);
    });
  });
});
