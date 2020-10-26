import { compile } from 'path-to-regexp';

import { ADMINISTRATOR_ROUTE_PATHS } from '../constants/paths';

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
