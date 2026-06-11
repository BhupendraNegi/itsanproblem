# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_06_11_000001) do
  create_table "comments", force: :cascade do |t|
    t.text "body", null: false
    t.integer "user_id", null: false
    t.integer "post_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "hidden_at"
    t.index ["post_id"], name: "index_comments_on_post_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "flags", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "flaggable_type", null: false
    t.integer "flaggable_id", null: false
    t.string "reason", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["flaggable_type", "flaggable_id"], name: "index_flags_on_flaggable"
    t.index ["user_id", "flaggable_type", "flaggable_id"], name: "index_flags_uniqueness", unique: true
    t.index ["user_id"], name: "index_flags_on_user_id"
  end

  create_table "helpful_marks", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "markable_type", null: false
    t.integer "markable_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["markable_type", "markable_id"], name: "index_helpful_marks_on_markable"
    t.index ["user_id", "markable_type", "markable_id"], name: "index_helpful_marks_uniqueness", unique: true
    t.index ["user_id"], name: "index_helpful_marks_on_user_id"
  end

  create_table "impersonations", force: :cascade do |t|
    t.integer "admin_id", null: false
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["admin_id"], name: "index_impersonations_on_admin_id"
    t.index ["user_id"], name: "index_impersonations_on_user_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "event", null: false
    t.integer "post_id", null: false
    t.integer "comment_id"
    t.datetime "read_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "digested_at"
    t.index ["comment_id"], name: "index_notifications_on_comment_id"
    t.index ["post_id"], name: "index_notifications_on_post_id"
    t.index ["user_id", "created_at"], name: "index_notifications_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "post_authors", force: :cascade do |t|
    t.integer "post_id", null: false
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_post_authors_on_post_id", unique: true
    t.index ["user_id"], name: "index_post_authors_on_user_id"
  end

  create_table "posts", force: :cascade do |t|
    t.string "title", null: false
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "anon_handle", null: false
    t.datetime "hidden_at"
  end

  create_table "user_stats", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "helpful_points", default: 0, null: false
    t.integer "comment_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_user_stats_on_user_id", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name", default: "", null: false
    t.text "bio"
    t.string "role", default: "member", null: false
    t.boolean "email_digest_enabled", default: true, null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["name"], name: "index_users_on_name"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["role"], name: "index_users_on_role"
  end

  add_foreign_key "comments", "posts"
  add_foreign_key "comments", "users"
  add_foreign_key "flags", "users"
  add_foreign_key "helpful_marks", "users"
  add_foreign_key "impersonations", "users"
  add_foreign_key "impersonations", "users", column: "admin_id"
  add_foreign_key "notifications", "comments"
  add_foreign_key "notifications", "posts"
  add_foreign_key "notifications", "users"
  add_foreign_key "post_authors", "posts"
  add_foreign_key "post_authors", "users"
  add_foreign_key "user_stats", "users"
end
