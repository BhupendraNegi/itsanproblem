class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
    :recoverable, :rememberable, :validatable

  enum :role, {member: "member", admin: "admin"}, default: :member

  has_many :post_authors, dependent: :destroy
  has_many :posts, through: :post_authors
  has_many :comments, dependent: :destroy
  has_many :notifications, dependent: :destroy
  has_one :user_stat, dependent: :destroy

  # has_many :through only removes the join rows on destroy; keep the old
  # semantics of deleting a user's posts along with the account.
  before_destroy :destroy_authored_posts, prepend: true

  validates :name, presence: true

  private

  def destroy_authored_posts
    # posts.destroy_all on a :through association only unlinks the join rows,
    # so destroy the posts themselves.
    post_authors.includes(:post).find_each { |author| author.post.destroy }
  end
end
