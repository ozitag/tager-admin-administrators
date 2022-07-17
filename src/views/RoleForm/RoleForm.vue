<template>
  <Page :title="pageTitle" :is-content-loading="isContentLoading">
    <form novalidate @submit.prevent>
      <FormField
          v-model:value="values.name"
          name="name"
          :error="errors.name"
          :label="$i18n.t('administrators:name')"
      />
      <FormFieldMultiSelect
          v-if="!values.isSuperAdmin"
          v-model:selected-options="values.scopes"
          name="scopes"
          :label="$i18n.t('administrators:privileges')"
          :options="scopeOptionList"
          :error="errors.scopes"
      />
    </form>

    <template #footer>
      <FormFooter
          :back-href="backButtonUrl"
          @submit="submitForm"
          :is-submitting="isSubmitting"
          :is-creation="isCreation"
          :can-create-another="isCreation"
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
  watch,
} from 'vue';

import {Page} from "@tager/admin-layout";

import {
  convertRequestErrorToMap, navigateBack,
  Nullable,
  useResource, useToast,
} from '@tager/admin-services';

import {useI18n} from "@tager/admin-services";

import {
  OptionType,
  FormFooter,
  TagerFormSubmitEvent,
  FormField, FormFieldMultiSelect
} from '@tager/admin-ui';

import {
  createRole,
  getRole,
  getScopes,
  updateRole,
} from '../../services/requests';
import {RoleType, ScopeGroupsData} from '../../typings/model';
import {getRoleFormUrl, getRoleListUrl} from '../../utils/paths';

import {
  convertFormValuesToRoleCreationPayload,
  convertFormValuesToRoleUpdatePayload,
  convertRoleToFormValues,
  convertScopeDataToOptions,
  FormValues,
} from './RoleForm.helpers';
import {useRoute, useRouter} from "vue-router";

export default defineComponent({
  name: 'RoleForm',
  components: {Page, FormFooter, FormField, FormFieldMultiSelect},
  setup() {
    const {t} = useI18n();

    const route = useRoute();
    const router = useRouter();
    const toast = useToast();

    const roleId = computed(() => route.params.roleId as string | number);

    const isCreation = computed(() => roleId.value === "create");

    const [fetchRole, {data: role, loading: isRoleLoading}] = useResource<Nullable<RoleType>>({
      fetchResource: () => getRole(roleId.value),
      initialValue: null,
      resourceName: 'Role',
    });

    /** Fetch scope list */
    const [
      fetchScopeData,
      {data: scopeData, loading: isScopeDataLoading},
    ] = useResource<Nullable<ScopeGroupsData>>({
      fetchResource: getScopes,
      initialValue: null,
      resourceName: 'Scope list',
    });

    onMounted(() => {
      fetchScopeData();

      if (isCreation.value) return;

      fetchRole();
    });

    /** Scope Options */
    const scopeOptionList = computed<Array<OptionType>>(() =>
        convertScopeDataToOptions(scopeData.value)
    );

    const values = ref<FormValues>(convertRoleToFormValues(role.value));

    const errors = ref<Record<string, string>>({});
    const isSubmitting = ref<boolean>(false);

    watch(role, () => {
      values.value = convertRoleToFormValues(role.value);
    });

    /** Submit Form */
    function submitForm(event: TagerFormSubmitEvent) {
      const creationBody = convertFormValuesToRoleCreationPayload(values.value);

      const updateBody = convertFormValuesToRoleUpdatePayload(values.value);
      const requestPromise = isCreation.value
          ? createRole(creationBody)
          : updateRole(roleId.value, updateBody);

      requestPromise
          .then(({data}) => {
            errors.value = {};


            if (event.type === "create") {
              router.push(getRoleFormUrl({roleId: data.id}));
            }

            if (event.type === "create_exit" || event.type === "save_exit") {
              navigateBack(router, getRoleListUrl());
            }

            if (event.type === 'create_create-another') {
              values.value = convertRoleToFormValues(null);
            }

            toast.show({
              variant: 'success',
              title: t('administrators:success'),
              body: isCreation.value
                  ? t('administrators:roleSuccessfullyCreated')
                  : t('administrators:roleSuccessfullyUpdate'),
            });
          })
          .catch((error) => {
            console.error(error);
            errors.value = convertRequestErrorToMap(error);
            toast.show({
              variant: 'danger',
              title: t('administrators:error'),
              body: isCreation.value
                  ? t('administrators:roleCreationError')
                  : t('administrators:roleUpdateError'),
            });
          })
          .finally(() => {
            isSubmitting.value = false;
          });
    }

    const pageTitle = computed<string>(() => {
      return isCreation.value
          ? t('administrators:createRole')
          : `${t('administrators:updateRole')} "${values.value.name}"`;
    });

    const isContentLoading = computed<boolean>(
        () => isRoleLoading.value || isScopeDataLoading.value
    );

    return {
      backButtonUrl: getRoleListUrl(),
      values,
      errors,
      isSubmitting,
      submitForm,
      isContentLoading,
      role,
      pageTitle,
      isCreation,
      scopeOptionList,
    };
  },
});
</script>

<style scoped lang="scss">
::v-deep [data-multi-select-list] {
  max-height: 500px;
}
</style>
