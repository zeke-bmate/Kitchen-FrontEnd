import type { UserPermission } from "./userPermission";

export type UserPermissionsResponse = {
  user: {
    id: number;
    name: string;
    username: string;
    role: {
      id: number;
      name: string;
    };
  };
  permissions: UserPermission[];
};