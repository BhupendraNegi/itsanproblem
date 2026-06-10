module Api
  module V1
    module Admin
      # The moderation queue: everything that has been flagged, hidden or not.
      class FlagsController < BaseController
        def index
          posts = Post.joins(:flags).distinct.includes(:flags)
          comments = Comment.joins(:flags).distinct.includes(:flags, :post)

          render json: {
            posts: posts.map { |post| post_entry(post) },
            comments: comments.map { |comment| comment_entry(comment) }
          }
        end

        private

        def post_entry(post)
          {
            id: post.id,
            title: post.title,
            body: post.body,
            hidden: post.hidden_at.present?,
            flag_count: post.flags.size,
            reasons: post.flags.map(&:reason).tally,
            created_at: post.created_at
          }
        end

        def comment_entry(comment)
          {
            id: comment.id,
            body: comment.body,
            post_id: comment.post_id,
            post_title: comment.post.title,
            hidden: comment.hidden_at.present?,
            flag_count: comment.flags.size,
            reasons: comment.flags.map(&:reason).tally,
            created_at: comment.created_at
          }
        end
      end
    end
  end
end
