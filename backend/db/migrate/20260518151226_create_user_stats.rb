class CreateUserStats < ActiveRecord::Migration[8.0]
  def change
    create_table :user_stats do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.integer :helpful_points, null: false, default: 0
      t.integer :comment_count, null: false, default: 0

      t.timestamps
    end
  end
end
