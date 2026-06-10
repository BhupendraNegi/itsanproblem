class Impersonation < ApplicationRecord
  belongs_to :admin, class_name: "User"
  belongs_to :user
end
