# Authorship ledger, deliberately separate from posts so the posts table alone
# can never identify who wrote what.
class PostAuthor < ApplicationRecord
  belongs_to :post
  belongs_to :user
end
