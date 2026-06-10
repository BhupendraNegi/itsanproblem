class CreateHelpfulMarks < ActiveRecord::Migration[8.0]
  def change
    create_table :helpful_marks do |t|
      t.references :user, null: false, foreign_key: true
      t.references :markable, polymorphic: true, null: false
      t.timestamps
    end

    add_index :helpful_marks, [:user_id, :markable_type, :markable_id],
      unique: true, name: "index_helpful_marks_uniqueness"
  end
end
