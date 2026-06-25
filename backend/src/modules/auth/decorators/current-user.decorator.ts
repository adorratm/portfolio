import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AdminUser } from '@modules/auth/entities/admin-user.entity';

/** Request'ten oturum açmış admin kullanıcısını çıkarır */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AdminUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AdminUser }>();
    return request.user;
  },
);
