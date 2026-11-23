import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

//setMetaData bruges til at definere metadata for en route handler eller controller.
//I dette tilfælde bruges den til at definere de roller, der er nødvendige for at få adgang til en bestemt route.
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);