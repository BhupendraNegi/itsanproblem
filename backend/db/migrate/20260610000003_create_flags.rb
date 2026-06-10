class CreateFlags < ActiveRecord::Migration[8.0]
  def change
    create_table :flags do |t|
      t.references :user, null: false, foreign_key: true
      t.references :flaggable, polymorphic: true, null: false
      t.string :reason, null: false
      t.timestamps
    end

    add_index :flags, [:user_id, :flaggable_type, :flaggable_id],
      unique: true, name: "index_flags_uniqueness"

    add_column :posts, :hidden_at, :datetime
    add_column :comments, :hidden_at, :datetime
  end
end
