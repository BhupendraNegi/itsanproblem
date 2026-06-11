class UserPolicy < ApplicationPolicy
  def index?
    user.staff?
  end

  # Role changes are admin-only (a moderator must never mint an admin), and
  # never on yourself — prevents accidental self-demotion.
  def update_role?
    user.admin? && record != user
  end

  # Admins impersonate anyone but themselves. Moderators only impersonate
  # members — impersonating an admin (or another moderator) would be an
  # escalation path.
  def impersonate?
    return false if record == user
    return true if user.admin?

    user.moderator? && record.member?
  end

  def destroy?
    user.admin? && record != user
  end
end
