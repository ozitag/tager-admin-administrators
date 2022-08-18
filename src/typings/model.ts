import { FieldShortType, IncomingValueUnion } from '@tager/admin-dynamic-field';

export type ScopeType = {
  readonly value: string;
  readonly label: string;
  readonly module: string;
};

export type RoleType = {
  readonly id: number;
  readonly name: string;
  readonly isSuperAdmin: boolean;
  readonly scopes: Array<ScopeType>;
};

export type ScopeGroupsData = {
  readonly groups: Array<{
    readonly name: string;
    readonly scopes: Array<ScopeType>;
  }>;
};

export type AdminType = {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly roles: Array<RoleType>;
  readonly isSelf: boolean;
  readonly isSuperAdmin: boolean;
  readonly params: Array<FieldShortType<IncomingValueUnion>>;
};
