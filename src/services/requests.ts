import { request, ResponseBody } from '@tager/admin-services';

import { AdminType, RoleType, ScopeGroupsData } from '../typings/model';

type SuccessData = { success: boolean };

/** Roles */

export function getRoleList(): Promise<ResponseBody<Array<RoleType>>> {
  return request.get({ path: '/admin/rbac/roles' });
}

export function getRole(
  roleId: string | number
): Promise<ResponseBody<RoleType>> {
  return request.get({ path: `/admin/rbac/roles/${roleId}` });
}

export type RoleCreationPayload = {
  name: string;
  scopes: Array<string>;
};

export function createRole(
  payload: RoleCreationPayload
): Promise<ResponseBody<RoleType>> {
  return request.post({ path: '/admin/rbac/roles', body: payload });
}

export type RoleUpdatePayload = RoleCreationPayload;

export function updateRole(
  roleId: string | number,
  payload: RoleUpdatePayload
): Promise<ResponseBody<RoleType>> {
  return request.put({ path: `/admin/rbac/roles/${roleId}`, body: payload });
}

export function deleteRole(roleId: string | number): Promise<SuccessData> {
  return request.delete({ path: `/admin/rbac/roles/${roleId}` });
}

/** Scopes */

export function getScopes(): Promise<ResponseBody<ScopeGroupsData>> {
  return request.get({ path: '/admin/rbac/scopes' });
}

/** Admin */

export function getAdminList(): Promise<ResponseBody<Array<AdminType>>> {
  return request.get({ path: '/admin/admins' });
}

export function getAdmin(
  adminId: string | number
): Promise<ResponseBody<AdminType>> {
  return request.get({ path: `/admin/admins/${adminId}` });
}

export type AdminUpdatePayload = {
  name: string;
  email: string;
  roles: Array<number>;
};

export type AdminCreationPayload = AdminUpdatePayload & {
  password: string;
};

export function createAdmin(
  payload: AdminCreationPayload
): Promise<ResponseBody<AdminType>> {
  return request.post({ path: '/admin/admins', body: payload });
}

export function updateAdmin(
  adminId: string | number,
  payload: AdminUpdatePayload
): Promise<ResponseBody<AdminType>> {
  return request.put({ path: `/admin/admins/${adminId}`, body: payload });
}

export function deleteAdmin(adminId: string | number): Promise<SuccessData> {
  return request.delete({ path: `/admin/admins/${adminId}` });
}
