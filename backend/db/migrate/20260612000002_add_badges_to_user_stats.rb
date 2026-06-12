class AddBadgesToUserStats < ActiveRecord::Migration[8.0]
  def change
    # Array of badge keys (see Badges::CATALOG). Awarded event-driven on
    # post/reply/helpful-mark, never revoked.
    add_column :user_stats, :badges, :json, null: false, default: []
  end
end
