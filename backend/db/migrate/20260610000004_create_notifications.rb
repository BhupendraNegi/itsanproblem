class CreateNotifications < ActiveRecord::Migration[8.0]
  def change
    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.string :event, null: false
      t.references :post, null: false, foreign_key: true
      t.references :comment, foreign_key: true
      t.datetime :read_at
      t.timestamps
    end

    add_index :notifications, [:user_id, :created_at]
  end
end
