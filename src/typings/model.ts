export type RoleType = {
  readonly id: number;
  readonly name: string;
  readonly isSuperAdmin: boolean;
  readonly scopes: Array<{
    readonly value: string;
    readonly label: string;
  }>;
};

export type ScopeType = {
  readonly groups: Array<{
    readonly name: string;
    scopes: Array<{
      readonly value: string;
      readonly name: string;
    }>;
  }>;
};

export type AdminType = {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly roles: Array<{ id: number }>;
};
