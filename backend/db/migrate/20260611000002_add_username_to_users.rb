class AddUsernameToUsers < ActiveRecord::Migration[8.0]
  def up
    add_column :users, :username, :string

    User.reset_column_information
    User.find_each do |user|
      user.update_columns(username: User.generate_username(user.name))
    end

    change_column_null :users, :username, false
    add_index :users, :username, unique: true
  end

  def down
    remove_column :users, :username
  end
end
