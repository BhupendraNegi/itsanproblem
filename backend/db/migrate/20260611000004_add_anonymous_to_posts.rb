class AddAnonymousToPosts < ActiveRecord::Migration[8.0]
  def up
    # New posts default to named; anonymity is an explicit per-post choice.
    add_column :posts, :anonymous, :boolean, null: false, default: false

    # Every existing post was created under the always-anonymous promise —
    # they must stay anonymous.
    execute "UPDATE posts SET anonymous = #{connection.quoted_true}"
  end

  def down
    remove_column :posts, :anonymous
  end
end
