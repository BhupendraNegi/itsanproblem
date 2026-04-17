class Post < ApplicationRecord
  belongs_to :user
  has_many :comments, dependent: :destroy

  validates :title, :body, presence: true

  def as_json(options = {})
    super({ only: [:id, :title, :body, :created_at] }.merge(options)).merge(
      author: "Anonymous",
      comments: comments.order(created_at: :asc).map(&:as_json)
    )
  end
end
