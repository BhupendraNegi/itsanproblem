class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
    :recoverable, :rememberable, :validatable

  # Lowercase letters/digits/underscores, 3–20 chars, and never all digits —
  # so /users/:username can also fall back to numeric ids unambiguously.
  USERNAME_FORMAT = /\A(?=.*[a-z_])[a-z0-9_]{3,20}\z/

  enum :role, {member: "member", moderator: "moderator", admin: "admin"}, default: :member

  # Staff can access the admin dashboard; only admins manage roles/accounts.
  def staff?
    admin? || moderator?
  end

  has_many :post_authors, dependent: :destroy
  has_many :posts, through: :post_authors
  has_many :comments, dependent: :destroy
  has_many :notifications, dependent: :destroy
  has_one :user_stat, dependent: :destroy

  before_validation :normalize_username
  before_validation :assign_username, on: :create

  # has_many :through only removes the join rows on destroy; keep the old
  # semantics of deleting a user's posts along with the account.
  before_destroy :destroy_authored_posts, prepend: true

  validates :name, presence: true, length: {maximum: 50}
  validates :bio, length: {maximum: 300}

  validates :username, presence: true, uniqueness: true,
    format: {with: USERNAME_FORMAT, message: "must be 3–20 lowercase letters, numbers, or underscores (not all numbers)"}

  # Derive a unique username from a display name ("Demo User" → demo_user).
  def self.generate_username(name)
    base = name.to_s.parameterize(separator: "_")[0, 20]
    base = "#{base}_#{SecureRandom.hex(1)}"[0, 20] if base.length < 3
    candidate = base
    5.times do
      return candidate unless exists?(username: candidate)
      candidate = "#{base[0, 14]}_#{SecureRandom.hex(2)}"
    end
    "user_#{SecureRandom.hex(4)}"
  end

  private

  def normalize_username
    self.username = username.strip.downcase if username
  end

  def assign_username
    self.username = self.class.generate_username(name) if username.blank?
  end

  def destroy_authored_posts
    # posts.destroy_all on a :through association only unlinks the join rows,
    # so destroy the posts themselves.
    post_authors.includes(:post).find_each { |author| author.post.destroy }
  end
end
