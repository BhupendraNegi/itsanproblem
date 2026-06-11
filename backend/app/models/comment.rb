class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :post
  has_many :helpful_marks, as: :markable, dependent: :destroy
  has_many :flags, as: :flaggable, dependent: :destroy

  validates :body, presence: true, length: {maximum: 2000}

  after_create :notify_post_author

  # The OP is always anonymous in their own thread (badged "OP" by the UI);
  # other commenters can opt in via the anonymous flag.
  def op?
    user_id == post.author_user_id
  end

  def hide_identity?
    op? || anonymous?
  end

  def as_json(options = {})
    viewer = options.delete(:viewer)
    hidden = hide_identity?
    super({only: [:id, :body, :created_at]}.merge(options)).merge(
      "author" => hidden ? "Anonymous" : user.name,
      "author_id" => hidden ? nil : user_id,
      "author_username" => hidden ? nil : user.username,
      "op" => op?,
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
