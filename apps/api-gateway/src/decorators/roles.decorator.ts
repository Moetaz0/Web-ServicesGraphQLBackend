import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../graphql/types';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
