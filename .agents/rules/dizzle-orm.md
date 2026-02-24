---
trigger: model_decision
description: When you want to use dirzzle-orm outside the db package.
---

Do not install drizzle-orm package outside the db package. You can directly import them from db package itself.

E.g. import { and, db, eq } from "@convoform/db";