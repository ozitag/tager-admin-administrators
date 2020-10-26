<template>
  <page
    :title="pageTitle"
    :is-content-loading="isContentLoading"
    :footer="{
      backHref: backButtonUrl,
      onSubmit: submitForm,
      isSubmitting: isSubmitting,
    }"
  >
    <form novalidate @submit.prevent>
      <template>
        <form-field
          v-model="values.name"
          name="name"
          :error="errors.name"
          label="Name"
        />
        <form-field-multi-select
          v-if="!values.isSuperAdmin"
          v-model="values.scopes"
          name="scopes"
          label="Privileges"
          :options="scopeOptionList"
          :error="errors.scopes"
        />
      </template>
    </form>
  </page>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  watch,
} from '@vue/composition-api';

import {
  convertRequestErrorToMap,
  Nullable,
  useResource,
} from '@tager/admin-services';
import { OptionType } from '@tager/admin-ui';

import {
  createRole,
  getRole,
  getScopes,
  updateRole,
} from '../../services/requests';
import { RoleType, ScopeGroupsData } from '../../typings/model';
import { getRoleListUrl } from '../../utils/paths';

import {
  convertFormValuesToRoleCreationPayload,
  convertFormValuesToRoleUpdatePayload,
  convertRoleToFormValues,
  convertScopeDataToOptions,
  FormValues,
} from './RoleForm.helpers';

export default defineComponent({
  name: 'RoleForm',
  setup(props, context) {
    const roleId = computed<string>(() => context.root.$route.params.roleId);

    const isCreation = computed<boolean>(() => roleId.value === 'create');

    const [fetchRole, { data: role, loading: isRoleLoading }] = useResource<
      Nullable<RoleType>
    >({
      fetchResource: () => getRole(roleId.value),
      initialValue: null,
      context,
      resourceName: 'Role',
    });

    /** Fetch scope list */
    const [
      fetchScopeData,
      { data: scopeData, loading: isScopeDataLoading },
    ] = useResource<Nullable<ScopeGroupsData>>({
      fetchResource: getScopes,
      initialValue: null,
      context,
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
    function submitForm() {
      const creationBody = convertFormValuesToRoleCreationPayload(values.value);

      const updateBody = convertFormValuesToRoleUpdatePayload(values.value);
      const requestPromise = isCreation.value
        ? createRole(creationBody)
        : updateRole(roleId.value, updateBody);

      requestPromise
        .then(() => {
          errors.value = {};
          context.root.$router.push(getRoleListUrl());
          context.root.$toast({
            variant: 'success',
            title: 'Success',
            body: isCreation.value
              ? `Role successfully created`
              : 'Role successfully update',
          });
        })
        .catch((error) => {
          console.error(error);
          errors.value = convertRequestErrorToMap(error);
          context.root.$toast({
            variant: 'danger',
            title: 'Error',
            body: isCreation.value
              ? `Role creation error`
              : 'Role update error',
          });
        })
        .finally(() => {
          isSubmitting.value = false;
        });
    }

    const pageTitle = computed<string>(() => {
      return isCreation.value
        ? `Create role`
        : `Update role "${values.value.name}"`;
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
