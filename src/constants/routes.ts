import { CustomRouteConfig } from '@tager/admin-layout';

import AdminList from '../views/AdminList';
import AdminForm from '../views/AdminForm';
import RoleList from '../views/RoleList';
import RoleForm from '../views/RoleForm';

import { ADMINISTRATOR_ROUTE_PATHS } from './paths';

const HOME_BREADCRUMB = { url: '/', text: 'Home' };

export const ADMIN_LIST_ROUTE: CustomRouteConfig = {
  path: ADMINISTRATOR_ROUTE_PATHS.ADMIN_LIST,
  component: AdminList,
  name: 'AdminList',
  meta: {
    getBreadcrumbs: () => [
      HOME_BREADCRUMB,
      { url: ADMINISTRATOR_ROUTE_PATHS.ADMIN_LIST, text: 'Admin List' },
    ],
  },
};

export const ADMIN_FORM_ROUTE: CustomRouteConfig = {
  path: ADMINISTRATOR_ROUTE_PATHS.ADMIN_FORM,
  component: AdminForm,
  name: 'AdminForm',
  meta: {
    getBreadcrumbs: (route) => [
      HOME_BREADCRUMB,
      { url: ADMINISTRATOR_ROUTE_PATHS.ADMIN_LIST, text: 'Admin List' },
      { url: route.path, text: 'Admin form' },
    ],
  },
};

export const ROLE_LIST_ROUTE: CustomRouteConfig = {
  path: ADMINISTRATOR_ROUTE_PATHS.ROLE_LIST,
  component: RoleList,
  name: 'RoleList',
  meta: {
    getBreadcrumbs: () => [
      HOME_BREADCRUMB,
      { url: ADMINISTRATOR_ROUTE_PATHS.ROLE_LIST, text: 'Role List' },
    ],
  },
};

export const ROLE_FORM_ROUTE: CustomRouteConfig = {
  path: ADMINISTRATOR_ROUTE_PATHS.ROLE_FORM,
  component: RoleForm,
  name: 'RoleForm',
  meta: {
    getBreadcrumbs: (route) => [
      HOME_BREADCRUMB,
      { url: ADMINISTRATOR_ROUTE_PATHS.ROLE_LIST, text: 'Role List' },
      { url: route.path, text: 'Role form' },
    ],
  },
};
