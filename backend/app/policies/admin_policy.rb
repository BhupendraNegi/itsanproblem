# Gate for the /api/v1/admin namespace as a whole (authorize! :admin).
# Moderators get dashboard access too; what they can do inside is decided
# per-resource (UserPolicy, PostPolicy, CommentPolicy).
class AdminPolicy < ApplicationPolicy
  def access?
    user.staff?
  end
end
