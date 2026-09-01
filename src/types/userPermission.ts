export type UserPermission = {
  id: number;
  key: string;
  description: string | null;
  module: string;
  roleGranted: boolean;
  override: boolean | null;
  effective: boolean;
};