import { Injectable, NotFoundException } from "@nestjs/common";

import { gitChangeItems, gitVersions } from "../../data/mock-store.js";

@Injectable()
export class VersionsService {
  list() {
    return gitVersions;
  }

  get(versionId: string) {
    const version = gitVersions.find((item) => item.id === versionId);
    if (!version) {
      throw new NotFoundException("VERSION_NOT_FOUND");
    }
    return {
      ...version,
      changeItems: gitChangeItems.filter((item) => item.gitVersionId === versionId)
    };
  }

  rollback(versionId: string) {
    this.get(versionId);
    return { versionId, status: "rolled_back" };
  }
}
