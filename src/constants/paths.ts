import { compile } from 'path-to-regexp';

export const ADMINISTRATOR_ROUTE_PATHS = {
  ROLE_LIST: '/roles',
  ROLE_FORM: '/roles/:roleId',
  ADMIN_LIST: '/admin',
  ADMIN_FORM: '/admin/:adminId',
} as const;

export function getRoleListUrl() {
  return ADMINISTRATOR_ROUTE_PATHS.ROLE_LIST;
}

export function getRoleFormUrl(params: { roleId: string | number }): string {
  return compile(ADMINISTRATOR_ROUTE_PATHS.ROLE_FORM)(params);
}

export function getAdminListUrl() {
  return ADMINISTRATOR_ROUTE_PATHS.ADMIN_LIST;
}

export function getAdminFormUrl(params: { adminId: string | number }): string {
  return compile(ADMINISTRATOR_ROUTE_PATHS.ADMIN_FORM)(params);
}
