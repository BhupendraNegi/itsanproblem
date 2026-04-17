class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :post

  validates :body, presence: true

  def as_json(options = {})
    super({ only: [:id, :body, :created_at] }.merge(options)).merge(
      author: user.name
    )
  end
end
