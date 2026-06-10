# Gate for the /api/v1/admin namespace as a whole (authorize! :admin).
class AdminPolicy < ApplicationPolicy
  def access?
    user.admin?
  end
end
