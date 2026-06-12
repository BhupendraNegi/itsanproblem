class Post < ApplicationRecord
  belongs_to :tag, optional: true
  has_one :post_author, dependent: :destroy
  has_one :author_user, through: :post_author, source: :user
  has_many :comments, inverse_of: :post, dependent: :destroy
  has_many :helpful_marks, as: :markable, dependent: :destroy
  has_many :flags, as: :flaggable, dependent: :destroy

  validates :title, presence: true, length: {maximum: 120}
  validates :body, presence: true, length: {maximum: 5000}

  before_create :assign_anon_handle

  scope :visible, -> { where(hidden_at: nil) }

  # Portable case-insensitive title/body search (SQLite dev, Postgres prod).
  # pg_trgm ranking can replace this if scale ever demands it.
  scope :search, ->(query) {
    term = "%#{sanitize_sql_like(query.to_s.strip.downcase)}%"
    # explicit ESCAPE so sanitize_sql_like's backslashes work on SQLite too
    where("LOWER(title) LIKE :q ESCAPE '\\' OR LOWER(body) LIKE :q ESCAPE '\\'", q: term)
  }

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
    # anon_handle stays internal — identity-shaped pseudonyms read like
    # usernames and undermine the "no identity at all" presentation.
    identity = if anonymous?
      {"author" => "Anonymous", "author_id" => nil, "author_username" => nil}
    else
      {"author" => author_user&.name || "Anonymous",
       "author_id" => author_user&.id,
       "author_username" => author_user&.username}
    end

    super({only: [:id, :title, :body, :created_at]}.merge(options)).merge(identity).merge(
      "anonymous" => anonymous?,
      "tag" => tag&.as_json,
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
