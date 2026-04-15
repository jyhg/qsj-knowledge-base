import { Controller, Get, Param, Post } from "@nestjs/common";

import { notifications } from "../../data/mock-store.js";

@Controller("notifications")
export class NotificationsController {
  @Get()
  list() {
    return notifications;
  }

  @Post(":notificationId/read")
  markRead(@Param("notificationId") notificationId: string) {
    const item = notifications.find((notice) => notice.id === notificationId);
    if (item) {
      item.status = "read";
    }
    return item ?? { id: notificationId, status: "read" };
  }
}

