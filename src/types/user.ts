import type { Role } from "./role";

export type User = {
    id: number;
    username: string;
    name: string;
    createdAt: string;
    role: Role;
};