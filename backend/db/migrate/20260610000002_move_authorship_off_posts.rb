# Anonymity hardening: authorship moves out of the posts table into a separate
# post_authors ledger, and every post gets a stable display handle. After this,
# a leaked posts row no longer identifies its author.
class MoveAuthorshipOffPosts < ActiveRecord::Migration[8.0]
  def up
    create_table :post_authors do |t|
      t.references :post, null: false, foreign_key: true, index: {unique: true}
      t.references :user, null: false, foreign_key: true
      t.timestamps
    end

    execute <<~SQL
      INSERT INTO post_authors (post_id, user_id, created_at, updated_at)
      SELECT id, user_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM posts
    SQL

    add_column :posts, :anon_handle, :string

    say_with_time "backfilling anon handles" do
      select_values("SELECT id FROM posts").each do |post_id|
        handle = "anon_#{SecureRandom.hex(2)}"
        execute "UPDATE posts SET anon_handle = #{quote(handle)} WHERE id = #{quote(post_id)}"
      end
    end

    change_column_null :posts, :anon_handle, false
    remove_column :posts, :user_id
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
