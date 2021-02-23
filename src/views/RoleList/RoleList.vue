<template>
  <page
    :title="t('administrators:listOfRoles')"
    :header-buttons="[
      {
        text: t('administrators:addRole'),
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
            {{ t('administrators:noPrivileges') }}
          </span>
          <span v-if="row.isSuperAdmin">{{ t('administrators:all') }}</span>
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
                v-for="scope of scopeGroup.scopes.slice(
                  0,
                  scopesPerModuleCount
                )"
                :key="scope.value"
              >
                <span>— {{ scope.label }}</span>
              </li>
            </ul>
            <span
              v-if="scopeGroup.scopes.length > scopesPerModuleCount"
              class="rest-scopes-text"
            >
              {{
                getRestScopesText(
                  scopeGroup.scopes.length - scopesPerModuleCount
                )
              }}
            </span>
          </div>
        </template>
        <template v-slot:cell(actions)="{ row }">
          <base-button
            variant="icon"
            :title="t('administrators:edit')"
            :disabled="isBusy(row.id)"
            :href="getRoleFormUrl({ roleId: row.id })"
          >
            <svg-icon name="edit"></svg-icon>
          </base-button>
          <base-button
            v-if="!row.isSuperAdmin"
            variant="icon"
            :title="t('administrators:delete')"
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
import { defineComponent, onMounted, SetupContext } from '@vue/composition-api';

import { useResource, useResourceDelete } from '@tager/admin-services';
import { ColumnDefinition, useTranslation } from '@tager/admin-ui';

import { RoleType, ScopeType } from '../../typings/model';
import { deleteRole, getRoleList } from '../../services/requests';
import { getRoleFormUrl } from '../../utils/paths';

export default defineComponent({
  name: 'RoleList',
  setup(props, context: SetupContext) {
    const { t } = useTranslation(context);

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

    function getRestScopesText(restPrivilegesCount: number): string {
      if (restPrivilegesCount === 1) {
        return 'and more 1 privilege...';
      }

      if (restPrivilegesCount > 1) {
        return `and more ${restPrivilegesCount} privileges...`;
      }

      return '';
    }

    const columnDefs: Array<ColumnDefinition<RoleType>> = [
      {
        id: 1,
        name: t('administrators:role'),
        field: 'name',
      },
      {
        id: 2,
        name: t('administrators:privileges'),
        field: 'scope',
      },
      {
        id: 3,
        name: t('administrators:actions'),
        field: 'actions',
        style: { width: '180px', textAlign: 'center', whiteSpace: 'nowrap' },
        headStyle: { width: '180px', textAlign: 'center' },
      },
    ];

    return {
      t,
      columnDefs,
      rowData: roleList,
      isRowDataLoading: isRoleLoading,
      errorMessage: error,
      isBusy,
      handleRoleDelete,
      getRoleFormUrl,
      getScopeGroupList,
      getRestScopesText,
      scopesPerModuleCount: 3,
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

.rest-scopes-text {
  padding-left: 35px;
}
</style>
