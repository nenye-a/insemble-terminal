# Migration `20200701130854-remove-coverage-connection`

This migration has been generated by RaymondAnggara at 7/1/2020, 1:08:54 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."CoverageData" DROP COLUMN "coverage";

ALTER TABLE "public"."CompareCoverageData" DROP COLUMN "coverage";

DROP TABLE "public"."_ComparationTagToCoverage";
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200701121842-add-map..20200701130854-remove-coverage-connection
--- datamodel.dml
+++ datamodel.dml
@@ -1,7 +1,7 @@
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url      = env("DATABASE_URL")
 }
 generator client {
   provider = "prisma-client-js"
@@ -181,9 +181,8 @@
   businessTag BusinessTag?
   performance Performance[]
   news        News[]
   activity    Activity[]
-  coverage    Coverage[]
 }
 model Performance {
   id              String                   @default(cuid()) @id
@@ -301,11 +300,8 @@
 model Coverage {
   id              String                @default(cuid()) @id
   locationTag     LocationTag?
   businessTag     BusinessTag?
-  comparationTags ComparationTag[]
-  data            CoverageData[]
-  compareData     CompareCoverageData[]
   createdAt       DateTime              @default(now())
   updatedAt       DateTime              @updatedAt
 }
```


