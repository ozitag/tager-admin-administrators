import { CustomRouteConfig } from '@tager/admin-layout';

import AdminList from '../views/AdminList';
import AdminForm from '../views/AdminForm';
import RoleList from '../views/RoleList';
import RoleForm from '../views/RoleForm';

import { ADMINISTRATOR_ROUTE_PATHS } from './paths';

export const ADMIN_LIST_ROUTE: CustomRouteConfig = {
  path: ADMINISTRATOR_ROUTE_PATHS.ADMIN_LIST,
  component: AdminList,
  name: 'AdminList',
  meta: {
    getBreadcrumbs: (route, t) => [
      { url: '/', text: t('administrators:home') },
      {
        url: ADMINISTRATOR_ROUTE_PATHS.ADMIN_LIST,
        text: t('administrators:adminList'),
      },
    ],
  },
};

export const ADMIN_FORM_ROUTE: CustomRouteConfig = {
  path: ADMINISTRATOR_ROUTE_PATHS.ADMIN_FORM,
  component: AdminForm,
  name: 'AdminForm',
  meta: {
    getBreadcrumbs: (route, t) => [
      { url: '/', text: t('administrators:home') },
      {
        url: ADMINISTRATOR_ROUTE_PATHS.ADMIN_LIST,
        text: t('administrators:adminList'),
      },
      { url: route.path, text: t('administrators:adminForm') },
    ],
  },
};

export const ROLE_LIST_ROUTE: CustomRouteConfig = {
  path: ADMINISTRATOR_ROUTE_PATHS.ROLE_LIST,
  component: RoleList,
  name: 'RoleList',
  meta: {
    getBreadcrumbs: (route, t) => [
      { url: '/', text: t('administrators:home') },
      {
        url: ADMINISTRATOR_ROUTE_PATHS.ROLE_LIST,
        text: t('administrators:roleList'),
      },
    ],
  },
};

export const ROLE_FORM_ROUTE: CustomRouteConfig = {
  path: ADMINISTRATOR_ROUTE_PATHS.ROLE_FORM,
  component: RoleForm,
  name: 'RoleForm',
  meta: {
    getBreadcrumbs: (route, t) => [
      { url: '/', text: t('administrators:home') },
      {
        url: ADMINISTRATOR_ROUTE_PATHS.ROLE_LIST,
        text: t('administrators:roleList'),
      },
      { url: route.path, text: t('administrators:roleForm') },
    ],
  },
};
