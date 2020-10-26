<template>
  <page
    title="List of roles"
    :header-buttons="[
      {
        text: 'Add role',
        href: getRoleFormUrl({ roleId: 'create' }),
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
        <template v-slot:cell(scopes)="{ row }">
          <ul>
            <li v-for="scopes of row.scopes" :key="scopes.name">
              {{ !row.isSuperAdmin ? scopes.label : 'All' }}
            </li>
          </ul>
        </template>
        <template v-slot:cell(actions)="{ row }">
          <base-button
            variant="icon"
            title="Edit"
            :disabled="isBusy(row.id)"
            :href="getRoleFormUrl({ roleId: row.id })"
          >
            <svg-icon name="edit"></svg-icon>
          </base-button>
          <base-button
            v-if="!row.isSuperAdmin"
            variant="icon"
            title="Delete"
            :disabled="isBusy(row.id)"
            @click="handleRoleDelete(row.id)"
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

import { RoleType } from '../../typings/model';
import { getRoleFormUrl } from '../../constants/paths';
import { deleteRole, getRoleList } from '../../services/requests';

const COLUMN_DEFS: Array<ColumnDefinition<RoleType>> = [
  {
    id: 1,
    name: 'Role',
    field: 'name',
  },
  {
    id: 2,
    name: 'Privileges',
    field: 'scopes',
  },
  {
    id: 3,
    name: 'Actions',
    field: 'actions',
    style: { width: '180px', textAlign: 'center', whiteSpace: 'nowrap' },
    headStyle: { width: '180px', textAlign: 'center' },
  },
];

export default defineComponent({
  name: 'RoleList',
  setup(props, context) {
    const [
      fetchRoleList,
      { data: roleList, loading: isRoleLoading, error },
    ] = useResource<Array<RoleType>>({
      fetchResource: getRoleList,
      initialValue: [],
      context,
      resourceName: 'Role list',
    });
    onMounted(() => {
      fetchRoleList();
    });

    const {
      handleResourceDelete: handleRoleDelete,
      isDeleting,
    } = useResourceDelete({
      deleteResource: deleteRole,
      resourceName: 'Role',
      onSuccess: fetchRoleList,
      context,
    });

    const isRowDataLoading = computed<boolean>(() => isRoleLoading.value);
    function isBusy(roleId: number): boolean {
      return isDeleting(roleId) || isRowDataLoading.value;
    }
    return {
      columnDefs: COLUMN_DEFS,
      rowData: roleList,
      isRowDataLoading,
      errorMessage: error,
      isBusy,
      handleRoleDelete,
      getRoleFormUrl,
    };
  },
});
</script>

<style roled></style>
