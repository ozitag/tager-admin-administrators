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
        <form-field
          v-model="values.email"
          name="email"
          :error="errors.email"
          :label="t('administrators:email')"
        />
        <form-field-multi-select
          v-model="values.roles"
          name="roles"
          :label="t('administrators:roles')"
          :options="roleOptionList"
          :error="errors.roles"
        />
        <form-field
          v-model="values.password"
          name="password"
          :error="errors.password"
          :label="
            isCreation
              ? t('administrators:password')
              : t('administrators:newPassword')
          "
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
import { OptionType, FormFooter, TagerFormSubmitEvent, useTranslation } from '@tager/admin-ui';

import { AdminType, RoleType } from '../../typings/model';
import {
  createAdmin,
  getAdmin,
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
  components: { FormFooter },
  setup(props, context: SetupContext) {
    const { t } = useTranslation(context);

    const adminId = computed<string>(() => context.root.$route.params.adminId);

    const isCreation = computed<boolean>(() => adminId.value === 'create');

    const [fetchAdmin, { data: admin, loading: isAdminLoading }] = useResource<
      Nullable<AdminType>
    >({
      fetchResource: () => getAdmin(adminId.value),
      initialValue: null,
      context,
      resourceName: 'Admin',
    });

    /** Fetch role list */

    const [
      fetchRoleList,
      { data: roleList, loading: isRoleListLoading },
    ] = useResource<Array<RoleType>>({
      fetchResource: getRoleList,
      initialValue: [],
      context,
      resourceName: 'Role list',
    });

    onMounted(() => {
      fetchRoleList();
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
        values.value
      );

      const updateBody = convertFormValuesToAdminUpdatePayload(values.value);

      const requestPromise = isCreation.value
        ? createAdmin(creationBody)
        : updateAdmin(adminId.value, updateBody);

      requestPromise
        .then(({ data }) => {
          errors.value = {};

          if (event.type === 'create') {
            context.root.$router.push(getAdminFormUrl({ adminId: data.id }));
          }

          if (event.type === 'create_exit' || event.type === 'save_exit') {
            context.root.$router.push(getAdminListUrl());
          }

          if (event.type === 'create_create-another') {
            values.value = convertAdminToFormValues(null, roleOptionList.value);
          }

          context.root.$toast({
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
          context.root.$toast({
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
      () => isAdminLoading.value || isRoleListLoading.value
    );

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
    };
  },
});
</script>

<style scoped></style>
