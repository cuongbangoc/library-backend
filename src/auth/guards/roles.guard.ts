import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Role } from "../../common/enums/role.enum.js";
import { ROLE_KEYS } from "../decorators/roles.decorator.js";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {
    }

    canActivate(context: ExecutionContext): boolean {
        // B1: Lay role trong controller
        const controllerRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLE_KEYS,
            [
                context.getHandler(),
                context.getClass(),
            ]
        );
        // Neu controller khong can Role, thi cho phep truy cap
        if (!controllerRoles) {
            return true;
        }

        // B2: Lay role cua user trong token
        const request = context.switchToHttp().getRequest();
        const user = request.user; // Payload trong JWT
        // Kiem tra khong co user hoac user khong co role nao
        if (!user || !user.role) {
            return false;
        }

        // B3: Kiem tra user co quyen truy cap vao controller khong
        // user.role la string, controllerRole la array
        return controllerRoles.includes(user.role);
    }
}