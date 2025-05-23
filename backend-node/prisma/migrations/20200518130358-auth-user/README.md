# Migration `20200518130358-auth-user`

This migration has been generated by RaymondAnggara at 5/18/2020, 1:03:58 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."UserSession" (
    "createdAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    "id" text  NOT NULL ,
    "token" text  NOT NULL DEFAULT '',
    "user" text  NOT NULL ,
    PRIMARY KEY ("id")
) 

CREATE TABLE "public"."UserRegisterVerification" (
    "email" text  NOT NULL DEFAULT '',
    "id" text  NOT NULL ,
    "tokenEmail" text  NOT NULL DEFAULT '',
    "tokenQuery" text  NOT NULL DEFAULT '',
    "userInput" text  NOT NULL DEFAULT '',
    "verified" boolean  NOT NULL DEFAULT false,
    PRIMARY KEY ("id")
) 

CREATE TABLE "public"."UserEmailVerification" (
    "email" text  NOT NULL DEFAULT '',
    "id" text  NOT NULL ,
    "tokenEmail" text  NOT NULL DEFAULT '',
    "user" text  NOT NULL ,
    "verified" boolean  NOT NULL DEFAULT false,
    PRIMARY KEY ("id")
) 

ALTER TABLE "public"."User" DROP COLUMN "phoneNumber",
ADD COLUMN "address" text   ,
ADD COLUMN "pendingEmail" boolean  NOT NULL DEFAULT false;

ALTER TABLE "public"."UserSession" ADD FOREIGN KEY ("user") REFERENCES "public"."User"("id") ON DELETE RESTRICT

ALTER TABLE "public"."UserEmailVerification" ADD FOREIGN KEY ("user") REFERENCES "public"."User"("id") ON DELETE RESTRICT
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200515165517-initial-user-model..20200518130358-auth-user
--- datamodel.dml
+++ datamodel.dml
@@ -1,22 +1,47 @@
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url      = "postgresql://prisma:prisma@localhost:5432/insemble-terminal?schema=public"
 }
 generator client {
   provider = "prisma-client-js"
 }
 model User {
-  id          String   @default(cuid()) @id
-  email       String   @unique
-  avatar      String?
-  password    String
-  firstName   String
-  lastName    String
-  company     String
-  phoneNumber String?
-  title       String?
-  description String?
-  createdAt   DateTime @default(now())
+  id            String   @default(cuid()) @id
+  email         String   @unique
+  avatar        String?
+  password      String
+  firstName     String
+  lastName      String
+  company       String
+  title         String?
+  description   String?
+  address       String?
+  pendingEmail  Boolean  @default(false)
+  createdAt     DateTime @default(now())
 }
+
+model UserSession {
+  id        String   @default(cuid()) @id
+  token     String
+  createdAt DateTime @default(now())
+  user      User
+}
+
+model UserRegisterVerification {
+  id            String  @default(cuid()) @id
+  email         String
+  userInput     String
+  verified      Boolean @default(false)
+  tokenEmail    String
+  tokenQuery    String
+}
+
+model UserEmailVerification {
+  id         String  @default(cuid()) @id
+  email      String
+  user       User
+  verified   Boolean @default(false)
+  tokenEmail String
+}
```


