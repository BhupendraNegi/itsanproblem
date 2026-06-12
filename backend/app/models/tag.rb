# The six seed rooms (academic, relationships, money, mental-health, housing,
# career). Created via db/seeds.rb; no user-created tags for now.
class Tag < ApplicationRecord
  has_many :posts, dependent: :nullify

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true, format: {with: /\A[a-z0-9-]+\z/}

  def as_json(_options = {})
    {"id" => id, "name" => name, "slug" => slug}
  end
end
