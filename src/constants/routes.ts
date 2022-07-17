import type { RouteRecordRaw } from "vue-router";

import AdminList from '../views/AdminList';
import AdminForm from '../views/AdminForm';
import RoleList from '../views/RoleList';
import RoleForm from '../views/RoleForm';

import { ADMINISTRATOR_ROUTE_PATHS } from './paths';

export const ADMIN_LIST_ROUTE: RouteRecordRaw = {
  path: ADMINISTRATOR_ROUTE_PATHS.ADMIN_LIST,
  component: AdminList,
  name: 'AdminList',
  meta: {
    getBreadcrumbs: (route, i18n) => [
      { url: '/', text: i18n.t('administrators:home') },
      {
        url: ADMINISTRATOR_ROUTE_PATHS.ADMIN_LIST,
        text: i18n.t('administrators:adminList'),
      },
    ],
  },
};

export const ADMIN_FORM_ROUTE: RouteRecordRaw = {
  path: ADMINISTRATOR_ROUTE_PATHS.ADMIN_FORM,
  component: AdminForm,
  name: 'AdminForm',
  meta: {
    getBreadcrumbs: (route, i18n) => [
      { url: '/', text: i18n.t('administrators:home') },
      {
        url: ADMINISTRATOR_ROUTE_PATHS.ADMIN_LIST,
        text: i18n.t('administrators:adminList'),
      },
      { url: route.path, text: i18n.t('administrators:adminForm') },
    ],
  },
};

export const ROLE_LIST_ROUTE: RouteRecordRaw = {
  path: ADMINISTRATOR_ROUTE_PATHS.ROLE_LIST,
  component: RoleList,
  name: 'RoleList',
  meta: {
    getBreadcrumbs: (route, i18n) => [
      { url: '/', text: i18n.t('administrators:home') },
      {
        url: ADMINISTRATOR_ROUTE_PATHS.ROLE_LIST,
        text: i18n.t('administrators:roleList'),
      },
    ],
  },
};

export const ROLE_FORM_ROUTE: RouteRecordRaw = {
  path: ADMINISTRATOR_ROUTE_PATHS.ROLE_FORM,
  component: RoleForm,
  name: 'RoleForm',
  meta: {
    getBreadcrumbs: (route, i18n) => [
      { url: '/', text: i18n.t('administrators:home') },
      {
        url: ADMINISTRATOR_ROUTE_PATHS.ROLE_LIST,
        text: i18n.t('administrators:roleList'),
      },
      { url: route.path, text: i18n.t('administrators:roleForm') },
    ],
  },
};
