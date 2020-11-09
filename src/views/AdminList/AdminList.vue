<template>
  <page
    title="Administrators"
    :header-buttons="[
      {
        text: 'Create administrator',
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
            title="Edit"
            :disabled="isBusy(row.id)"
            :href="getAdminFormUrl({ adminId: row.id })"
          >
            <svg-icon name="edit"></svg-icon>
          </base-button>
          <base-button
            v-if="!row.isSuperAdmin || !row.isSelf"
            variant="icon"
            title="Delete"
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
import { computed, defineComponent, onMounted } from '@vue/composition-api';

import { useResource, useResourceDelete } from '@tager/admin-services';
import { ColumnDefinition } from '@tager/admin-ui';

import { AdminType } from '../../typings/model';
import { deleteAdmin, getAdminList } from '../../services/requests';
import { getAdminFormUrl } from '../../utils/paths';

const COLUMN_DEFS: Array<ColumnDefinition<AdminType>> = [
  {
    id: 1,
    name: 'Admin',
    field: 'name',
  },
  {
    id: 2,
    name: 'Email',
    field: 'email',
  },
  {
    id: 3,
    name: 'Roles',
    field: 'roles',
  },
  {
    id: 4,
    name: 'Actions',
    field: 'actions',
    style: { width: '180px', textAlign: 'center', whiteSpace: 'nowrap' },
    headStyle: { width: '180px', textAlign: 'center' },
  },
];

export default defineComponent({
  name: 'AdminList',
  setup(props, context) {
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
    return {
      columnDefs: COLUMN_DEFS,
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
