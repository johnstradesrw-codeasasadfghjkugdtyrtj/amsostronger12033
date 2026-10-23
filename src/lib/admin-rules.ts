export function canManageAccount(isSuperAdmin: boolean, targetIsAdmin: boolean) {
  return isSuperAdmin && !targetIsAdmin;
}