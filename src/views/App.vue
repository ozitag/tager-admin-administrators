<template>
  <page-layout :sidebar-menu-list="sidebarMenuList">
    <router-view />
  </page-layout>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from '@vue/composition-api';

import { MenuItemType } from '@tager/admin-layout';
import { useTranslation } from '@tager/admin-ui';

import {
  getAdminFormUrl,
  getAdminListUrl,
  getRoleFormUrl,
  getRoleListUrl,
} from '../utils/paths';

export default defineComponent({
  name: 'App',
  setup(props, context: SetupContext) {
    const { t } = useTranslation(context);

    const sidebarMenuList: Array<MenuItemType> = [
      {
        id: 'admins',
        text: t('administrators:administrators'),
        icon: 'viewList',
        children: [
          { url: getRoleListUrl(), text: t('administrators:roles') },
          {
            url: getRoleFormUrl({ roleId: 'create' }),
            text: t('administrators:createRole'),
          },
          { url: getAdminListUrl(), text: t('administrators:admins') },
          {
            url: getAdminFormUrl({ adminId: 'create' }),
            text: t('administrators:createAdmin'),
          },
        ],
      },
    ];

    return {
      sidebarMenuList,
    };
  },
});
</script>

<style scoped lang="scss"></style>
