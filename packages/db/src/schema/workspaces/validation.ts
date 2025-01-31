import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { allPlans } from "../plan/config";
import { limitsV1 } from "../plan/schema";
import { workspacePlans, workspaceRole } from "./constants";
import { workspace } from "./workspace";

export const workspacePlanSchema = z.enum(workspacePlans);
export const workspaceRoleSchema = z.enum(workspaceRole);

export const selectWorkspaceSchema = createSelectSchema(workspace).extend({
  limits: z.string().transform((val) => {
    const parsed = JSON.parse(val);
    const result = limitsV1.safeParse(parsed);
    if (result.error) {
      // Fallback to default limits
      return limitsV1.parse({
        ...allPlans.free.limits,
      });
    }

    return result.data;
  }),
  plan: z
    .enum(workspacePlans)
    .nullable()
    .default("free")
    .transform((val) => val ?? "free"),
});

export const insertWorkspaceSchema = createSelectSchema(workspace);

export type Workspace = z.infer<typeof selectWorkspaceSchema>;
export type WorkspacePlan = z.infer<typeof workspacePlanSchema>;
export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>;
