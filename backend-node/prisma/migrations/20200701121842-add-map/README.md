# Migration `20200701121842-add-map`

This migration has been generated by RaymondAnggara at 7/1/2020, 12:18:42 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."MapData" (
    "coverageData" text  NOT NULL DEFAULT '',
    "id" text  NOT NULL ,
    "location" text  NOT NULL DEFAULT '',
    "map" text   ,
    "name" text  NOT NULL DEFAULT '',
    "numLocations" text   ,
    PRIMARY KEY ("id")
) 

CREATE TABLE "public"."CompareMapData" (
    "compareId" text  NOT NULL DEFAULT '',
    "coverageData" text  NOT NULL DEFAULT '',
    "id" text  NOT NULL ,
    "location" text  NOT NULL DEFAULT '',
    "map" text   ,
    "name" text  NOT NULL DEFAULT '',
    "numLocations" text   ,
    PRIMARY KEY ("id")
) 

CREATE TABLE "public"."Map" (
    "businessTag" text   ,
    "createdAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    "id" text  NOT NULL ,
    "locationTag" text   ,
    "updatedAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    PRIMARY KEY ("id")
) 

ALTER TABLE "public"."ComparationTag" ADD COLUMN "map" text   ;

ALTER TABLE "public"."MapData" ADD FOREIGN KEY ("map") REFERENCES "public"."Map"("id") ON DELETE SET NULL

ALTER TABLE "public"."CompareMapData" ADD FOREIGN KEY ("map") REFERENCES "public"."Map"("id") ON DELETE SET NULL

ALTER TABLE "public"."Map" ADD FOREIGN KEY ("locationTag") REFERENCES "public"."LocationTag"("id") ON DELETE SET NULL

ALTER TABLE "public"."Map" ADD FOREIGN KEY ("businessTag") REFERENCES "public"."BusinessTag"("id") ON DELETE SET NULL

ALTER TABLE "public"."ComparationTag" ADD FOREIGN KEY ("map") REFERENCES "public"."Map"("id") ON DELETE SET NULL
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200630112630-coverage-to-map..20200701121842-add-map
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
@@ -43,8 +43,9 @@
   ACTIVITY
   OWNERSHIP_INFO
   OWNERSHIP_CONTACT
   COVERAGE
+  MAP
   NOTE
 }
 enum OwnershipType {
@@ -307,8 +308,37 @@
   createdAt       DateTime              @default(now())
   updatedAt       DateTime              @updatedAt
 }
+model MapData {
+  id           String             @default(cuid()) @id
+  name         String
+  location     String
+  numLocations String?
+  coverageData String
+}
+
+model CompareMapData {
+  id           String             @default(cuid()) @id
+  name         String
+  location     String
+  numLocations String?
+  coverageData String
+  compareId    String
+}
+
+model Map {
+  id              String                @default(cuid()) @id
+  locationTag     LocationTag?
+  businessTag     BusinessTag?
+  comparationTags ComparationTag[]
+  data            MapData[]
+  compareData     CompareMapData[]
+  createdAt       DateTime              @default(now())
+  updatedAt       DateTime              @updatedAt
+}
+
+
 model OwnershipContactData {
   id    String @default(cuid()) @id
   name  String
   title String
```


