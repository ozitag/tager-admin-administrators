<template>
  <page
    :title="t('administrators:administrators')"
    :header-buttons="[
      {
        text: t('administrators:createAdministrator'),
        href: getAdminFormUrl({ adminId: 'create' }),
      },
    ]"
  >
    <template v-slot:content>
      <base-table
        :column-defs="columnDefs"
        :row-data="rowData"
        :loading="isRowDataLoading"
        :error-message="errorMessage"
      >
        <template v-slot:cell(roles)="{ row }">
          <ul>
            <li v-for="role of row.roles" :key="role.id">
              {{ role.name }}
            </li>
          </ul>
        </template>
        <template v-slot:cell(actions)="{ row }">
          <base-button
            v-if="!row.isSelf"
            variant="icon"
            :title="t('administrators:edit')"
            :disabled="isBusy(row.id)"
            :href="getAdminFormUrl({ adminId: row.id })"
          >
            <svg-icon name="edit"></svg-icon>
          </base-button>
          <base-button
            v-if="!row.isSuperAdmin || !row.isSelf"
            variant="icon"
            :title="t('administrators:delete')"
            :disabled="isBusy(row.id)"
            @click="handleAdminDelete(row.id)"
          >
            <svg-icon name="delete"></svg-icon>
          </base-button>
        </template>
      </base-table>
    </template>
  </page>
</template>

<script lang="ts">
import { defineComponent, onMounted, SetupContext } from '@vue/composition-api';

import { useResource, useResourceDelete } from '@tager/admin-services';
import { ColumnDefinition, useTranslation } from '@tager/admin-ui';

import { AdminType } from '../../typings/model';
import { deleteAdmin, getAdminList } from '../../services/requests';
import { getAdminFormUrl } from '../../utils/paths';

export default defineComponent({
  name: 'AdminList',
  setup(props, context: SetupContext) {
    const { t } = useTranslation(context);

    const [
      fetchAdminList,
      { data: adminList, loading: isAdminLoading, error },
    ] = useResource<Array<AdminType>>({
      fetchResource: getAdminList,
      initialValue: [],
      context,
      resourceName: 'Admin list',
    });

    onMounted(() => {
      fetchAdminList();
    });

    const {
      handleResourceDelete: handleAdminDelete,
      isDeleting,
    } = useResourceDelete({
      deleteResource: deleteAdmin,
      resourceName: 'Admin',
      onSuccess: fetchAdminList,
      context,
    });

    function isBusy(adminId: number): boolean {
      return isDeleting(adminId) || isAdminLoading.value;
    }

    const columnDefs: Array<ColumnDefinition<AdminType>> = [
      {
        id: 1,
        name: t('administrators:admin'),
        field: 'name',
      },
      {
        id: 2,
        name: t('administrators:email'),
        field: 'email',
      },
      {
        id: 3,
        name: t('administrators:roles'),
        field: 'roles',
      },
      {
        id: 4,
        name: t('administrators:actions'),
        field: 'actions',
        style: { width: '180px', textAlign: 'center', whiteSpace: 'nowrap' },
        headStyle: { width: '180px', textAlign: 'center' },
      },
    ];

    return {
      t,
      columnDefs,
      rowData: adminList,
      isRowDataLoading: isAdminLoading,
      errorMessage: error,
      isBusy,
      handleAdminDelete,
      getAdminFormUrl,
    };
  },
});
</script>

<style scoped></style>
