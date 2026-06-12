class CreateTags < ActiveRecord::Migration[8.0]
  def change
    create_table :tags do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.timestamps
    end
    add_index :tags, :slug, unique: true

    # One tag per post for now (the roadmap's post_tags join can replace this
    # if multi-tag ever ships); optional so tagging adds no posting friction.
    add_reference :posts, :tag, foreign_key: true
  end
end
