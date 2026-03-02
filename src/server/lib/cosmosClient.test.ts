import { describe, it, expect, vi } from "vitest";

vi.mock("@azure/cosmos", () => {
  const createIfNotExists = vi.fn();
  const containerCreateIfNotExists = vi.fn();
  return {
    CosmosClient: vi.fn().mockImplementation(() => ({
      getDatabaseAccount: vi.fn(),
      databases: {
        createIfNotExists: createIfNotExists.mockResolvedValue({
          database: {
            containers: {
              createIfNotExists: containerCreateIfNotExists,
            },
          },
        }),
      },
    })),
    _createIfNotExists: createIfNotExists,
    _containerCreateIfNotExists: containerCreateIfNotExists,
  };
});

vi.mock("@azure/identity", () => ({
  DefaultAzureCredential: vi.fn().mockImplementation(() => ({})),
}));

import { createCosmosContainers } from "./cosmosClient.js";
import { CosmosClient } from "@azure/cosmos";

describe("createCosmosContainers", () => {
  it("resolves without throwing when Cosmos responds successfully", async () => {
    const mockInstance = (CosmosClient as ReturnType<typeof vi.fn>).mock.results[0]?.value;
    if (mockInstance) {
      mockInstance.databases.createIfNotExists.mockResolvedValue({
        database: {
          containers: {
            createIfNotExists: vi.fn().mockResolvedValue({}),
          },
        },
      });
    }
    await expect(createCosmosContainers()).resolves.toBeUndefined();
  });

  it("propagates errors from database creation (no-op try/catch was removed)", async () => {
    const mockInstance = (CosmosClient as ReturnType<typeof vi.fn>).mock.results[0]?.value;
    if (mockInstance) {
      mockInstance.databases.createIfNotExists.mockRejectedValue(
        new Error("Cosmos DB unavailable")
      );
    }
    await expect(createCosmosContainers()).rejects.toThrow("Cosmos DB unavailable");
  });
});
