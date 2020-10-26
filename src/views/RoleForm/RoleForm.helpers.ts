import { Nullable } from '@tager/admin-services';
import { OptionType } from '@tager/admin-ui';

import { RoleType, ScopeGroupsData } from '../../typings/model';
import {
  RoleCreationPayload,
  RoleUpdatePayload,
} from '../../services/requests';

export type FormValues = {
  name: string;
  scopes: Array<OptionType>;
  isSuperAdmin: boolean;
};

export function convertRoleToFormValues(role: Nullable<RoleType>): FormValues {
  if (!role) {
    return {
      name: '',
      scopes: [],
      isSuperAdmin: false,
    };
  }

  return {
    name: role.name,
    scopes: role.scopes,
    isSuperAdmin: role.isSuperAdmin,
  };
}

export function convertFormValuesToRoleCreationPayload(
  values: FormValues
): RoleCreationPayload {
  return {
    name: values.name,
    scopes: values.scopes.map((scope) => scope.value),
  };
}

export function convertFormValuesToRoleUpdatePayload(
  values: FormValues
): RoleUpdatePayload {
  return {
    ...convertFormValuesToRoleCreationPayload(values),
  };
}

export function convertScopeDataToOptions(
  scopeData: Nullable<ScopeGroupsData>
): Array<OptionType> {
  if (!scopeData) return [];
  return scopeData.groups
    .map((group) =>
      group.scopes.map((scope) => ({
        value: scope.value,
        label: `${group.name}: ${scope.label}`,
      }))
    )
    .flat();
}
