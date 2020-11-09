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
        <form-field
          v-model="values.email"
          name="email"
          :error="errors.email"
          label="Email"
        />
        <form-field-multi-select
          v-model="values.roles"
          name="roles"
          label="Roles"
          :options="roleOptionList"
          :error="errors.roles"
        />
        <form-field
          v-model="values.password"
          name="password"
          :error="errors.password"
          :label="isCreation ? 'Password' : 'New password'"
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

import { AdminType, RoleType } from '../../typings/model';
import {
  createAdmin,
  getAdmin,
  getRoleList,
  updateAdmin,
} from '../../services/requests';
import { getAdminListUrl } from '../../utils/paths';

import {
  convertFormValuesToAdminCreationPayload,
  convertFormValuesToAdminUpdatePayload,
  convertAdminToFormValues,
  convertRoleListToOptions,
  FormValues,
} from './AdminForm.helpers';

export default defineComponent({
  name: 'AdminForm',
  setup(props, context) {
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
    function submitForm() {
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
        .then(() => {
          errors.value = {};
          context.root.$router.push(getAdminListUrl());
          context.root.$toast({
            variant: 'success',
            title: 'Success',
            body: isCreation.value
              ? `Admin successfully created`
              : 'Admin successfully updated',
          });
        })
        .catch((error) => {
          console.error(error);
          errors.value = convertRequestErrorToMap(error);
          context.root.$toast({
            variant: 'danger',
            title: 'Error',
            body: isCreation.value
              ? `Admin creation error`
              : 'Admin update error',
          });
        })
        .finally(() => {
          isSubmitting.value = false;
        });
    }

    const pageTitle = computed<string>(() => {
      return isCreation.value
        ? 'Create admin'
        : `Update admin "${values.value.name}"`;
    });

    const isContentLoading = computed<boolean>(
      () => isAdminLoading.value || isRoleListLoading.value
    );

    return {
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
