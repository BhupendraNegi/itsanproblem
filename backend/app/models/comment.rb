class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :post
  has_many :helpful_marks, as: :markable, dependent: :destroy
  has_many :flags, as: :flaggable, dependent: :destroy

  validates :body, presence: true

  after_create :notify_post_author

  def as_json(options = {})
    viewer = options.delete(:viewer)
    # The OP stays anonymous in their own thread: their replies carry the
    # post's anon handle instead of their real name.
    op = user_id == post.author_user_id
    super({only: [:id, :body, :created_at]}.merge(options)).merge(
      "author" => op ? post.anon_handle : user.name,
      "author_id" => op ? nil : user_id,
      "helpful_count" => helpful_marks.size,
      "viewer_marked" => viewer ? helpful_marks.any? { |m| m.user_id == viewer.id } : false
    )
  end

  private

  def notify_post_author
    recipient_id = post.author_user_id
    return if recipient_id.nil? || recipient_id == user_id

    Notification.create!(user_id: recipient_id, event: "reply", post: post, comment: self)
  end
end
