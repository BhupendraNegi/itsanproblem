class AddDigestTracking < ActiveRecord::Migration[8.0]
  def change
    # Set once a notification has been included in a digest email, so the
    # next run only picks up what the user hasn't seen or been emailed about.
    add_column :notifications, :digested_at, :datetime
    add_column :users, :email_digest_enabled, :boolean, null: false, default: true
  end
end
