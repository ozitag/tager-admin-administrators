import { Nullable } from '@tager/admin-services';
import { OptionType } from '@tager/admin-ui';

import { AdminType, RoleType, ScopeGroupsData } from '../../typings/model';
import {
  AdminCreationPayload,
  AdminUpdatePayload,
} from '../../services/requests';

export type FormValues = {
  name: string;
  email: string;
  password: string;
  roles: Array<OptionType<number>>;
};

export function convertAdminToFormValues(
  admin: Nullable<AdminType>,
  roleOptionList: Array<OptionType<number>>
): FormValues {
  if (!admin) {
    return {
      name: '',
      email: '',
      password: '',
      roles: [],
    };
  }
  const currentRoleOptionList = roleOptionList.filter((role) =>
    admin.roles.some((roles) => roles.id === role.value)
  );

  return {
    name: admin.name,
    email: admin.email,
    password: admin.password,
    roles: currentRoleOptionList,
  };
}

export function convertFormValuesToAdminUpdatePayload(
  values: FormValues
): AdminUpdatePayload {
  return {
    name: values.name,
    email: values.email,
    roles: values.roles.map((role) => role.value),
    password: values.password,
  };
}

export function convertFormValuesToAdminCreationPayload(
  values: FormValues
): AdminCreationPayload {
  return {
    ...convertFormValuesToAdminUpdatePayload(values),
  };
}

export function convertRoleListToOptions(
  roleList: Array<RoleType>
): Array<OptionType<number>> {
  return roleList.map((role) => ({
    value: role.id,
    label: role.name,
  }));
}
