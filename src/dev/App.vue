<template>
  <PageLayout :sidebar-menu-list="sidebarMenuList">
    <router-view/>
  </PageLayout>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

import {MenuItemType, PageLayout} from "@tager/admin-layout";

import {ViewListIcon} from "@tager/admin-ui";

import {
  getAdminFormUrl,
  getAdminListUrl,
  getRoleFormUrl,
  getRoleListUrl,
} from '../utils/paths';
import {useI18n} from "@tager/admin-services";

export default defineComponent({
  name: 'App',
  components: {
    PageLayout,
  },
  setup() {
    const i18n = useI18n();

    const sidebarMenuList: Array<MenuItemType> = [
      {
        id: 'admins',
        text: i18n.t('administrators:administrators'),
        icon: ViewListIcon,
        children: [
          {url: getRoleListUrl(), text: i18n.t('administrators:roles')},
          {
            url: getRoleFormUrl({roleId: 'create'}),
            text: i18n.t('administrators:createRole'),
          },
          {url: getAdminListUrl(), text: i18n.t('administrators:admins')},
          {
            url: getAdminFormUrl({adminId: 'create'}),
            text: i18n.t('administrators:createAdmin'),
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
