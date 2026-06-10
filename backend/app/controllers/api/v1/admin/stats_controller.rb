module Api
  module V1
    module Admin
      class StatsController < BaseController
        def show
          render json: {
            users: User.count,
            posts: Post.count,
            comments: Comment.count,
            flags: Flag.count,
            hidden_posts: Post.where.not(hidden_at: nil).count,
            hidden_comments: Comment.where.not(hidden_at: nil).count
          }
        end
      end
    end
  end
end
