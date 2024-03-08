import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from 'src/decorators/role.enum';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector, private jwtService: JwtService) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            // No role metadata defined, allow access
            return true;
        }
        
        const request = context.switchToHttp().getRequest();
        //console.log(request)
        
        const token = request.headers.authorization.split(' ')[1];

        if (!token) {
            return false;
        }

        try {
            const decoded = this.jwtService.decode(token);
            const userRole = decoded['role'];
            console.log(userRole)

            const hasRequiredRole = requiredRoles.includes(userRole);

            return hasRequiredRole;
        }
        catch (error) {
            return false;
        }
    }
}
