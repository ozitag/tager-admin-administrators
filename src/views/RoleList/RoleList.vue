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
          <span v-if="row.isSuperAdmin">All</span>
          <span v-if="row.scopes.length === 0" :style="{ fontStyle: 'italic' }"
            >No privileges</span
          >
          <ul v-else class="scope-list">
            <li v-for="(scopes, index) of row.scopes" :key="scopes.value">
              <h4
                v-if="
                  index !== 0
                    ? row.scopes[index].module !== row.scopes[index - 1].module
                    : true
                "
              >
                {{ scopes.module }}
              </h4>
              <span>{{ scopes.label }}</span>
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
import { defineComponent, onMounted } from '@vue/composition-api';

import { useResource, useResourceDelete } from '@tager/admin-services';
import { ColumnDefinition } from '@tager/admin-ui';

import { RoleType } from '../../typings/model';
import { deleteRole, getRoleList } from '../../services/requests';
import { getRoleFormUrl } from '../../utils/paths';

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

    function isBusy(roleId: number): boolean {
      return isDeleting(roleId) || isRoleLoading.value;
    }

    return {
      columnDefs: COLUMN_DEFS,
      rowData: roleList,
      isRowDataLoading: isRoleLoading,
      errorMessage: error,
      isBusy,
      handleRoleDelete,
      getRoleFormUrl,
    };
  },
});
</script>

<style lang="scss">
.scope-list {
  li {
    span {
      margin-left: 26px;
      position: relative;
      &:before {
        content: '—';
        position: absolute;
        left: -23px;
        top: -1px;
      }
    }
  }
}
</style>
