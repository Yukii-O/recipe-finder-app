-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "favorite_recipes" (
    "id_user" UUID NOT NULL,
    "id_recipe" INTEGER NOT NULL,
    "favorited_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_recipes_pkey" PRIMARY KEY ("id_user","id_recipe")
);

-- CreateTable
CREATE TABLE "shopping_list" (
    "id_list" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_user" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shopping_list_pkey" PRIMARY KEY ("id_list")
);

-- CreateTable
CREATE TABLE "shopping_list_items" (
    "id_item" SERIAL NOT NULL,
    "id_shopping_list" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "quantity" DECIMAL,
    "unit" VARCHAR(100),
    "bought" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "shopping_list_items_pkey" PRIMARY KEY ("id_item")
);

-- CreateTable
CREATE TABLE "users" (
    "id_user" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(100) NOT NULL,
    "senha" VARCHAR(150) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateIndex
CREATE INDEX "idx_favorite_recipes_user" ON "favorite_recipes"("id_user");

-- CreateIndex
CREATE INDEX "idx_shopping_list_user" ON "shopping_list"("id_user");

-- CreateIndex
CREATE INDEX "idx_shopping_list_items_list" ON "shopping_list_items"("id_shopping_list");

-- CreateIndex
CREATE UNIQUE INDEX "shopping_list_items_id_shopping_list_name_key" ON "shopping_list_items"("id_shopping_list", "name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "favorite_recipes" ADD CONSTRAINT "favorite_recipes_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shopping_list" ADD CONSTRAINT "shopping_list_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_id_shopping_list_fkey" FOREIGN KEY ("id_shopping_list") REFERENCES "shopping_list"("id_list") ON DELETE CASCADE ON UPDATE NO ACTION;

