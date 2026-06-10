class CommentPolicy < ApplicationPolicy
  def restore?
    user.admin?
  end

  def destroy?
    user.admin?
  end
end
