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
        <template v-slot:cell(scope)="{ row }">
          <span v-if="row.scopes.length === 0" class="no-scopes">
            No privileges
          </span>
          <span v-if="row.isSuperAdmin">All</span>
          <div
            v-for="scopeGroup in getScopeGroupList(row.scopes)"
            v-else
            :key="scopeGroup.module"
            class="scope-group"
          >
            <span class="module-name">
              {{ scopeGroup.module }}
            </span>
            <ul class="scope-list">
              <li
                v-for="scope of scopeGroup.scopes.slice(0, 3)"
                :key="scope.value"
              >
                <span>— {{ scope.label }}</span>
              </li>
            </ul>
            <span
              v-if="scopeGroup.scopes.length > 3"
              class="other-privileges-block"
            >
              <span v-if="scopeGroup.scopes.length - 3 >= 2">
                and more {{ scopeGroup.scopes.length - 3 }} privileges...
              </span>
              <span v-else> and more 1 privilege... </span>
            </span>
          </div>
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

import { RoleType, ScopeType } from '../../typings/model';
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
    field: 'scope',
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

    function getScopeGroupList(
      scopes: Array<ScopeType>
    ): Array<{ module: string; scopes: ScopeType }> {
      const map = new Map();
      scopes.forEach((scope) => {
        const key = scope.module;
        const value = map.get(key) ?? [];
        value.push(scope);
        map.set(key, value);
      });
      return Array.from(map.entries()).map(([key, value]) => ({
        module: key,
        scopes: value,
      }));
    }

    return {
      columnDefs: COLUMN_DEFS,
      rowData: roleList,
      isRowDataLoading: isRoleLoading,
      errorMessage: error,
      isBusy,
      handleRoleDelete,
      getRoleFormUrl,
      getScopeGroupList,
    };
  },
});
</script>

<style lang="scss">
.no-scopes {
  font-style: italic;
}

.scope-group {
  margin-bottom: 0.5rem;
}

.module-name {
  display: block;
  font-weight: bold;
  margin-bottom: 0.3rem;
}

.scope-list {
  padding-left: 1rem;
}

.other-privileges-block {
  padding-left: 35px;
}
</style>
