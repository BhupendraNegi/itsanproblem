class PostPolicy < ApplicationPolicy
  def restore?
    user.staff?
  end

  def destroy?
    user.staff?
  end
end
