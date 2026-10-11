CREATE TABLE "Resource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

CREATE TABLE "_ResourceToRoom" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ResourceToRoom_A_fkey" FOREIGN KEY ("A") REFERENCES "Resource" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ResourceToRoom_B_fkey" FOREIGN KEY ("B") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "Resource" ("id", "name")
SELECT lower(hex(randomblob(16))), trim(resource.value)
FROM "Room",
     json_each(
         CASE
             WHEN json_valid("Room"."resources") THEN "Room"."resources"
             ELSE '[]'
         END
     ) AS resource
WHERE resource.type = 'text'
  AND trim(resource.value) <> ''
GROUP BY trim(resource.value);

INSERT INTO "_ResourceToRoom" ("A", "B")
SELECT "Resource"."id", "Room"."id"
FROM "Room",
     json_each(
         CASE
             WHEN json_valid("Room"."resources") THEN "Room"."resources"
             ELSE '[]'
         END
     ) AS resource_value
JOIN "Resource" ON "Resource"."name" = trim(resource_value.value)
WHERE resource_value.type = 'text'
  AND trim(resource_value.value) <> '';

CREATE UNIQUE INDEX "Resource_name_key" ON "Resource"("name");
CREATE UNIQUE INDEX "_ResourceToRoom_AB_unique" ON "_ResourceToRoom"("A", "B");
CREATE INDEX "_ResourceToRoom_B_index" ON "_ResourceToRoom"("B");

ALTER TABLE "Room" DROP COLUMN "resources";