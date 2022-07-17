<template>
  <Page
      :title="$i18n.t('administrators:listOfRoles')"
      :header-buttons="[
      {
        text: $i18n.t('administrators:addRole'),
        href: getRoleFormUrl({ roleId: 'create' }),
      },
    ]"
  >
    <DataTable
        :column-defs="columnDefs"
        :row-data="rowData"
        :loading="isRowDataLoading"
        :error-message="errorMessage"
    >
      <template #cell(scope)="{ row }">
          <span v-if="row.scopes.length === 0" class="no-scopes">
            {{ $i18n.t('administrators:noPrivileges') }}
          </span>
        <span v-if="row.isSuperAdmin">{{ $i18n.t('administrators:all') }}</span>
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
      <template #cell(actions)="{ row }">
        <BaseButton
            variant="icon"
            :title="$i18n.t('administrators:edit')"
            :disabled="isBusy(row.id)"
            :href="getRoleFormUrl({ roleId: row.id })"
        >
          <EditIcon/>
        </BaseButton>
        <BaseButton
            v-if="!row.isSuperAdmin"
            variant="icon"
            :title="$i18n.t('administrators:delete')"
            :disabled="isBusy(row.id)"
            @click="handleRoleDelete(row.id)"
        >
          <DeleteIcon/>
        </BaseButton>
      </template>
    </DataTable>
  </Page>
</template>

<script lang="ts">
import {defineComponent, onMounted} from "vue";

import {useResourceDelete, useI18n} from '@tager/admin-services';
import {Page} from "@tager/admin-layout";

import {
  BaseButton,
  type ColumnDefinition,
  DataTable,
  DeleteIcon,
  EditIcon,
  useDataTable,
} from "@tager/admin-ui";

import {RoleType, ScopeType} from '../../typings/model';
import {deleteRole, getRoleList} from '../../services/requests';
import {getRoleFormUrl} from '../../utils/paths';

export default defineComponent({
  name: 'RoleList',
  components: {
    Page,
    DeleteIcon,
    EditIcon,
    DataTable,
    BaseButton,
  },
  setup() {
    const {t} = useI18n();

    const {
      fetchEntityList: fetchRoleList,
      isLoading: isRoleListLoading,
      rowData: roleList,
      errorMessage: error,
    } = useDataTable<RoleType>({
      fetchEntityList: (params) => getRoleList(),
      initialValue: [],
      resourceName: "Role list",
      pageSize: 100,
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
    });

    function isBusy(roleId: number): boolean {
      return isDeleting(roleId) || isRoleListLoading.value;
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
        return t('administrators:andMorePrivilege', {count: 1});
      }

      if (restPrivilegesCount > 1) {
        return t('administrators:andMorePrivilege', {
          count: restPrivilegesCount,
        });
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
        style: {width: '180px', textAlign: 'center', whiteSpace: 'nowrap'},
        headStyle: {width: '180px', textAlign: 'center'},
      },
    ];

    return {
      columnDefs,
      rowData: roleList,
      isRowDataLoading: isRoleListLoading,
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
