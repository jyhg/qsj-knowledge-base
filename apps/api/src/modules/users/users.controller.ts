import { Controller, Get } from "@nestjs/common";

import { users } from "../../data/mock-store.js";

@Controller("me")
export class UsersController {
  @Get()
  getMe() {
    return users[0];
  }
}

