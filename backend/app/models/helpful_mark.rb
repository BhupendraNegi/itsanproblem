class HelpfulMark < ApplicationRecord
  belongs_to :user
  belongs_to :markable, polymorphic: true

  validates :user_id, uniqueness: {scope: [:markable_type, :markable_id]}

  # Reputation rule: only the OP's mark on a comment feeds the commenter's
  # helpful_points. Crowd marks count for sorting only.
  after_create :award_op_point
  after_create :notify_comment_author
  after_create :award_badges
  after_destroy :revoke_op_point

  private

  # Anonymous replies earn no reputation — points are the reward for putting
  # your name on advice.
  def op_mark_on_comment?
    markable.is_a?(Comment) && !markable.anonymous? && markable.post.author_user_id == user_id
  end

  def award_op_point
    return unless op_mark_on_comment?
    UserStat.for_user(markable.user).increment!(:helpful_points)
  end

  def revoke_op_point
    return unless op_mark_on_comment?
    stat = UserStat.for_user(markable.user)
    stat.decrement!(:helpful_points) if stat.helpful_points.positive?
  end

  def award_badges
    Badges.refresh!(markable.user) if markable.is_a?(Comment)
  end

  def notify_comment_author
    return unless markable.is_a?(Comment)
    return if markable.user_id == user_id

    Notification.create!(user_id: markable.user_id, event: "helpful_mark", post: markable.post, comment: markable)
  end
end
