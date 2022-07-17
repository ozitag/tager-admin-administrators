<template>
  <Page
      :title="$i18n.t('administrators:administrators')"
      :header-buttons="[
      {
        text: $i18n.t('administrators:createAdministrator'),
        href: getAdminFormUrl({ adminId: 'create' }),
      },
    ]"
  >
    <DataTable
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
      <template #cell(actions)="{ row }">
        <BaseButton
            v-if="!row.isSelf"
            variant="icon"
            :title="$i18n.t('administrators:edit')"
            :disabled="isBusy(row.id)"
            :href="getAdminFormUrl({ adminId: row.id })"
        >
          <EditIcon/>
        </BaseButton>
        <BaseButton
            v-if="!row.isSuperAdmin || !row.isSelf"
            variant="icon"
            :title="$i18n.t('administrators:delete')"
            :disabled="isBusy(row.id)"
            @click="handleAdminDelete(row.id)"
        >
          <DeleteIcon/>
        </BaseButton>
      </template>
    </DataTable>
  </Page>
</template>

<script lang="ts">
import {defineComponent, onMounted} from 'vue';

import {useResourceDelete} from '@tager/admin-services';
import {ColumnDefinition, DataTable, BaseButton, DeleteIcon, EditIcon, useDataTable} from '@tager/admin-ui';
import {useI18n} from "@tager/admin-services";

import {AdminType} from '../../typings/model';
import {deleteAdmin, getAdminList} from '../../services/requests';
import {getAdminFormUrl} from '../../utils/paths';

import {Page} from "@tager/admin-layout";

export default defineComponent({
  name: 'AdminList',
  components: {
    Page, DataTable, BaseButton, DeleteIcon, EditIcon
  },
  setup() {
    const {t} = useI18n();

    const {
      fetchEntityList: fetchAdminList,
      isLoading: isAdminListLoading,
      rowData: adminList,
      errorMessage: error,
    } = useDataTable<AdminType>({
      fetchEntityList: () => getAdminList(),
      initialValue: [],
      resourceName: "Admin list",
      pageSize: 100,
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
    });

    function isBusy(adminId: number): boolean {
      return isDeleting(adminId) || isAdminListLoading.value;
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
        style: {width: '180px', textAlign: 'center', whiteSpace: 'nowrap'},
        headStyle: {width: '180px', textAlign: 'center'},
      },
    ];

    return {
      t,
      columnDefs,
      rowData: adminList,
      isRowDataLoading: isAdminListLoading,
      errorMessage: error,
      isBusy,
      handleAdminDelete,
      getAdminFormUrl,
    };
  },
});
</script>

<style scoped></style>
