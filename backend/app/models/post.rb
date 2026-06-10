class Post < ApplicationRecord
  has_one :post_author, dependent: :destroy
  has_one :author_user, through: :post_author, source: :user
  has_many :comments, inverse_of: :post, dependent: :destroy
  has_many :helpful_marks, as: :markable, dependent: :destroy
  has_many :flags, as: :flaggable, dependent: :destroy

  validates :title, :body, presence: true

  before_create :assign_anon_handle

  scope :visible, -> { where(hidden_at: nil) }

  # Hot = most helpful marks within the last 7 days, ties broken by recency.
  scope :hot, -> {
    where(created_at: 7.days.ago..)
      .left_joins(:helpful_marks)
      .group("posts.id")
      .order(Arel.sql("COUNT(helpful_marks.id) DESC"), created_at: :desc)
  }

  def author_user_id
    post_author&.user_id
  end

  def as_json(options = {})
    viewer = options.delete(:viewer)
    super({only: [:id, :title, :body, :created_at]}.merge(options)).merge(
      "author" => "Anonymous",
      "anon_handle" => anon_handle,
      "helpful_count" => helpful_marks.size,
      "viewer_marked" => viewer ? helpful_marks.any? { |m| m.user_id == viewer.id } : false,
      "comments" => comments.reject(&:hidden_at).sort_by(&:created_at).map { |c| c.as_json(viewer: viewer) }
    )
  end

  private

  def assign_anon_handle
    self.anon_handle ||= generate_anon_handle
  end

  # Memorable, stable within the thread, different across threads (anon_a91f).
  def generate_anon_handle
    5.times do
      candidate = "anon_#{SecureRandom.hex(2)}"
      return candidate unless self.class.exists?(anon_handle: candidate)
    end
    "anon_#{SecureRandom.hex(4)}"
  end
end
