class AddAnonymousToComments < ActiveRecord::Migration[8.0]
  def change
    # Opt-in anonymity for replies. Authorship (user_id) is always recorded —
    # this only controls presentation.
    add_column :comments, :anonymous, :boolean, null: false, default: false
  end
end
