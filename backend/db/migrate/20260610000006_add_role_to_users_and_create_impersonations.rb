class AddRoleToUsersAndCreateImpersonations < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :role, :string, null: false, default: "member"
    add_index :users, :role

    # Audit trail: every admin impersonation is recorded (who, whom, when).
    create_table :impersonations do |t|
      t.references :admin, null: false, foreign_key: {to_table: :users}
      t.references :user, null: false, foreign_key: true
      t.timestamps
    end
  end
end
