import { Controller, Get, Query } from "@nestjs/common";

import type { UserRole } from "@qsj/shared-types";

import { users } from "../../data/mock-store.js";

@Controller("me")
export class UsersController {
  @Get()
  getMe(@Query("role") role?: UserRole) {
    if (!role) {
      return users[0];
    }

    return users.find((user) => user.role === role) ?? users[0];
  }
}

