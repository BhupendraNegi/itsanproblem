class UserPolicy < ApplicationPolicy
  def index?
    user.admin?
  end

  # Admins can't change their own role or impersonate/delete themselves —
  # prevents accidental self-demotion and self-targeted audit noise.
  def update_role?
    user.admin? && record != user
  end

  def impersonate?
    user.admin? && record != user
  end

  def destroy?
    user.admin? && record != user
  end
end
