import { Nullable } from '@tager/admin-services';
import { OptionType } from '@tager/admin-ui';

import { RoleType, ScopeType } from '../../typings/model';
import {
  RoleCreationPayload,
  RoleUpdatePayload,
} from '../../services/requests';

export type FormValues = {
  name: string;
  scopes: Array<OptionType>;
  isSuperAdmin: boolean;
};

export function convertRoleToFormValues(
  role: Nullable<RoleType>,
  scopeOptionList: Array<OptionType>
): FormValues {
  if (!role) {
    return {
      name: '',
      scopes: [],
      isSuperAdmin: false,
    };
  }

  const currentScopeOptionList = scopeOptionList.filter((scope) =>
    role.scopes.some((scopes) => scopes.value === scope.value)
  );

  return {
    name: role.name ?? '',
    scopes: currentScopeOptionList,
    isSuperAdmin: role.isSuperAdmin ?? false,
  };
}

export function convertFormValuesToRoleCreationPayload(
  values: FormValues
): RoleCreationPayload {
  return {
    name: values.name ?? null,
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
  scopeData: Nullable<ScopeType>
): Array<OptionType> {
  if (!scopeData) return [];
  return scopeData.groups
    .map((group) =>
      group.scopes.map((scope) => ({
        value: scope.value,
        label: `${group.name}: ${scope.name}`,
      }))
    )
    .flat();
}
