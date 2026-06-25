import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** JWT korumalı route'lar için guard */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
