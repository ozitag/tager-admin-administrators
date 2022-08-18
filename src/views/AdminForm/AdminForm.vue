<template>
  <Page :title="pageTitle" :is-content-loading="isContentLoading">
    <form novalidate @submit.prevent>
      <TabList v-model:tab-id="selectedTabId" :tab-list="tabList" />

      <template v-if="selectedTabId === 'general'">
        <FormField
          v-model:value="values.name"
          name="name"
          :error="errors.name"
          :label="$i18n.t('administrators:name')"
        />
        <FormField
          v-model:value="values.email"
          name="email"
          :error="errors.email"
          :label="$i18n.t('administrators:email')"
        />
        <FormFieldMultiSelect
          v-model:selected-options="values.roles"
          name="roles"
          :label="$i18n.t('administrators:roles')"
          :options="roleOptionList"
          :error="errors.roles"
        />
        <FormField
          v-model:value="values.password"
          name="password"
          :error="errors.password"
          :label="
            isCreation
              ? $i18n.t('administrators:password')
              : $i18n.t('administrators:newPassword')
          "
        />
      </template>

      <template v-if="selectedTabId === 'params'">
        <DynamicField
          v-for="field of templateValues"
          :key="field.config.name"
          :field="field"
        />
      </template>
    </form>

    <template #footer>
      <FormFooter
        :back-href="backButtonUrl"
        :is-submitting="isSubmitting"
        :is-creation="isCreation"
        :can-create-another="isCreation"
        @submit="submitForm"
      />
    </template>
  </Page>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  SetupContext,
  watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@tager/admin-layout';
import {
  convertRequestErrorToMap,
  navigateBack,
  notEmpty,
  Nullable,
  useResource,
  useToast,
} from '@tager/admin-services';
import {
  OptionType,
  FormFooter,
  TagerFormSubmitEvent,
  FormField,
  FormFieldMultiSelect,
  TabType,
  TabList,
} from '@tager/admin-ui';
import { useI18n } from '@tager/admin-services';
import {
  DynamicField,
  FieldConfigUnion,
  FieldShortType,
  FieldUnion,
  IncomingValueUnion,
  universalFieldUtils,
} from '@tager/admin-dynamic-field';

import { AdminType, RoleType } from '../../typings/model';
import {
  createAdmin,
  getAdmin,
  getFieldList,
  getRoleList,
  updateAdmin,
} from '../../services/requests';
import { getAdminFormUrl, getAdminListUrl } from '../../utils/paths';

import {
  convertFormValuesToAdminCreationPayload,
  convertFormValuesToAdminUpdatePayload,
  convertAdminToFormValues,
  convertRoleListToOptions,
  FormValues,
} from './AdminForm.helpers';

export default defineComponent({
  name: 'AdminForm',
  components: {
    DynamicField,
    TabList,
    Page,
    FormFooter,
    FormField,
    FormFieldMultiSelect,
  },
  setup() {
    const { t } = useI18n();

    const route = useRoute();
    const router = useRouter();
    const toast = useToast();

    const adminId = computed(() => route.params.adminId as string | number);

    const isCreation = computed(() => adminId.value === 'create');

    const [fetchAdmin, { data: admin, loading: isAdminLoading }] = useResource<
      Nullable<AdminType>
    >({
      fetchResource: () => getAdmin(adminId.value),
      initialValue: null,
      resourceName: 'Admin',
    });

    /** Fetch role list */

    const [fetchRoleList, { data: roleList, loading: isRoleListLoading }] =
      useResource<Array<RoleType>>({
        fetchResource: getRoleList,
        initialValue: [],
        resourceName: 'Role List',
      });

    const [fetchFieldList, { data: fieldList, loading: isFieldListLoading }] =
      useResource<Array<FieldConfigUnion>>({
        fetchResource: getFieldList,
        initialValue: [],
        resourceName: 'Field List',
      });

    onMounted(() => {
      fetchRoleList();
      fetchFieldList();
      updateTemplateValues();
      if (isCreation.value) return;
      fetchAdmin();
    });

    /** Role Options */
    const roleOptionList = computed<Array<OptionType<number>>>(() =>
      convertRoleListToOptions(roleList.value)
    );

    const values = ref<FormValues>(
      convertAdminToFormValues(admin.value, roleOptionList.value)
    );

    const errors = ref<Record<string, string>>({});
    const isSubmitting = ref<boolean>(false);

    watch([admin, roleOptionList], () => {
      values.value = convertAdminToFormValues(
        admin.value,
        roleOptionList.value
      );
    });

    /** Submit Form */
    function submitForm(event: TagerFormSubmitEvent) {
      /** Admin can't update self */
      if (admin.value && admin.value.isSelf) return;

      const creationBody = convertFormValuesToAdminCreationPayload(
        values.value,
        templateValues.value
      );

      const updateBody = convertFormValuesToAdminUpdatePayload(
        values.value,
        templateValues.value
      );

      const requestPromise = isCreation.value
        ? createAdmin(creationBody)
        : updateAdmin(adminId.value, updateBody);

      requestPromise
        .then(({ data }) => {
          errors.value = {};

          if (event.type === 'create') {
            router.push(getAdminFormUrl({ adminId: data.id }));
          }

          if (event.type === 'create_exit' || event.type === 'save_exit') {
            navigateBack(router, getAdminListUrl());
          }

          if (event.type === 'create_create-another') {
            values.value = convertAdminToFormValues(null, roleOptionList.value);
          }

          toast.show({
            variant: 'success',
            title: t('administrators:success'),
            body: isCreation.value
              ? t('administrators:adminSuccessfullyCreated')
              : t('administrators:adminSuccessfullyUpdated'),
          });
        })
        .catch((error) => {
          console.error(error);
          errors.value = convertRequestErrorToMap(error);
          toast.show({
            variant: 'danger',
            title: t('administrators:error'),
            body: isCreation.value
              ? t('administrators:adminCreationError')
              : t('administrators:adminUpdateError'),
          });
        })
        .finally(() => {
          isSubmitting.value = false;
        });
    }

    const pageTitle = computed<string>(() => {
      return isCreation.value
        ? t('administrators:createAdmin')
        : `${t('administrators:updateAdmin')} "${values.value.name}"`;
    });

    const isContentLoading = computed<boolean>(
      () =>
        isAdminLoading.value ||
        isRoleListLoading.value ||
        isFieldListLoading.value
    );

    /** Tabs */

    const shouldDisplayParamsTab = computed<boolean>(
      () => fieldList.value.length > 0
    );

    const tabList = computed<Array<TabType>>(() => {
      return [
        { id: 'general', label: t('administrators:tabs.general') },
        shouldDisplayParamsTab.value
          ? { id: 'params', label: t('administrators:tabs.params') }
          : null,
      ].filter(notEmpty);
    });

    const selectedTabId = ref<string>(tabList.value[0].id);

    const templateValues = ref<Array<FieldUnion>>([]);

    function updateTemplateValues() {
      const incomingFieldList: Array<FieldShortType<IncomingValueUnion>> =
        admin.value?.params ?? [];

      templateValues.value = fieldList.value.map((fieldConfig, index) =>
        universalFieldUtils.createFormField(
          fieldConfig,
          incomingFieldList[index]?.value
        )
      );
    }

    watch([admin, fieldList], () => {
      updateTemplateValues();
    });

    return {
      t,
      backButtonUrl: getAdminListUrl(),
      values,
      errors,
      isSubmitting,
      submitForm,
      isContentLoading,
      admin,
      pageTitle,
      isCreation,
      roleOptionList,
      tabList,
      selectedTabId,
      templateValues,
    };
  },
});
</script>

<style scoped></style>
