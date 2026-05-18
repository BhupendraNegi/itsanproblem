class UserStat < ApplicationRecord
  belongs_to :user

  def self.for_user(user)
    find_or_create_by(user: user) do |stat|
      stat.helpful_points = 0
      stat.comment_count = user.comments.count
    end
  end
end
