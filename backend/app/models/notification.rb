# The way back to your own anonymous posts: posters can't find them in the
# feed, so replies and helpful marks must come to them.
class Notification < ApplicationRecord
  EVENTS = %w[reply helpful_mark].freeze

  belongs_to :user
  belongs_to :post
  belongs_to :comment, optional: true

  validates :event, inclusion: {in: EVENTS}

  scope :unread, -> { where(read_at: nil) }

  def as_json(options = {})
    super({only: [:id, :event, :post_id, :created_at]}.merge(options)).merge(
      "post_title" => post.title,
      "read" => read_at.present?
    )
  end
end
