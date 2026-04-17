module Api
  module V1
    class CommentsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_post

      def create
        comment = @post.comments.build(comment_params.merge(user: current_user))

        if comment.save
          render json: comment.as_json, status: :created
        else
          render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_post
        @post = Post.find(params[:post_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Post not found" }, status: :not_found
      end

      def comment_params
        params.require(:comment).permit(:body)
      end
    end
  end
end
