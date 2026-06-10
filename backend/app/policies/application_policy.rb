class ApplicationPolicy < ActionPolicy::Base
  authorize :user

  # Deny by default; policies opt in explicitly.
  default_rule :deny_all

  def deny_all
    false
  end
end
