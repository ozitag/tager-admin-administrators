import { Nullable, createId } from '@tager/admin-services';
import { OptionType } from '@tager/admin-ui';
import { FieldUnion, universalFieldUtils } from '@tager/admin-dynamic-field';

import { AdminType, RoleType } from '../../typings/model';
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
      password: createId(),
      roles: [],
    };
  }
  const currentRoleOptionList = roleOptionList.filter((role) =>
    admin.roles.some((roles) => roles.id === role.value)
  );

  return {
    name: admin.name,
    email: admin.email,
    password: '',
    roles: currentRoleOptionList,
  };
}

export function convertFormValuesToAdminUpdatePayload(
  values: FormValues,
  paramsValues: Array<FieldUnion> = []
): AdminUpdatePayload {
  return {
    name: values.name,
    email: values.email,
    roles: values.roles.map((role) => role.value),
    password: values.password,
    params: paramsValues.map((field) => ({
      value: universalFieldUtils.getOutgoingValue(field),
      name: field.config.name,
    })),
  };
}

export function convertFormValuesToAdminCreationPayload(
  values: FormValues,
  paramsValues: Array<FieldUnion> = []
): AdminCreationPayload {
  return {
    ...convertFormValuesToAdminUpdatePayload(values, paramsValues),
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
