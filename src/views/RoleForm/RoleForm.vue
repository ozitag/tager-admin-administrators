<template>
  <page :title="pageTitle" :is-content-loading="isContentLoading">
    <form novalidate @submit.prevent>
      <template>
        <form-field
          v-model="values.name"
          name="name"
          :error="errors.name"
          :label="t('administrators:name')"
        />
        <form-field-multi-select
          v-if="!values.isSuperAdmin"
          v-model="values.scopes"
          name="scopes"
          :label="t('administrators:privileges')"
          :options="scopeOptionList"
          :error="errors.scopes"
        />
      </template>
    </form>

    <template v-slot:footer>
      <FormFooter
        :back-href="backButtonUrl"
        :on-submit="submitForm"
        :is-submitting="isSubmitting"
        :is-creation="isCreation"
        :can-create-another="isCreation"
      />
    </template>
  </page>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  SetupContext,
  watch,
} from '@vue/composition-api';

import {
  convertRequestErrorToMap,
  Nullable,
  useResource,
} from '@tager/admin-services';
import {
  OptionType,
  FormFooter,
  TagerFormSubmitEvent,
  useTranslation,
} from '@tager/admin-ui';

import {
  createRole,
  getRole,
  getScopes,
  updateRole,
} from '../../services/requests';
import { RoleType, ScopeGroupsData } from '../../typings/model';
import { getRoleFormUrl, getRoleListUrl } from '../../utils/paths';

import {
  convertFormValuesToRoleCreationPayload,
  convertFormValuesToRoleUpdatePayload,
  convertRoleToFormValues,
  convertScopeDataToOptions,
  FormValues,
} from './RoleForm.helpers';

export default defineComponent({
  name: 'RoleForm',
  components: { FormFooter },
  setup(props, context: SetupContext) {
    const { t } = useTranslation(context);

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
    function submitForm(event: TagerFormSubmitEvent) {
      const creationBody = convertFormValuesToRoleCreationPayload(values.value);

      const updateBody = convertFormValuesToRoleUpdatePayload(values.value);
      const requestPromise = isCreation.value
        ? createRole(creationBody)
        : updateRole(roleId.value, updateBody);

      requestPromise
        .then(({ data }) => {
          errors.value = {};

          if (event.type === 'create') {
            context.root.$router.push(getRoleFormUrl({ roleId: data.id }));
          }

          if (event.type === 'create_exit' || event.type === 'save_exit') {
            context.root.$router.push(getRoleListUrl());
          }

          if (event.type === 'create_create-another') {
            values.value = convertRoleToFormValues(null);
          }

          context.root.$toast({
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
          context.root.$toast({
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
      t,
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
