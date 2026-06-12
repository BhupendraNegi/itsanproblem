module Api
  module V1
    class TagsController < ApplicationController
      def index
        tags = Tag.order(:id).left_joins(:posts)
          .select("tags.*, COUNT(posts.id) AS posts_count")
          .group("tags.id")
        render json: tags.map { |tag| tag.as_json.merge("post_count" => tag.posts_count) }
      end
    end
  end
end
