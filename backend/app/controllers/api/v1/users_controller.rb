module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate_user!
      before_action :set_user

      def show
        stat = UserStat.for_user(@user)
        recent_comments = @user.comments
          .includes(:post)
          .order(created_at: :desc)
          .limit(20)
          .map do |c|
            {
              id: c.id,
              body: c.body,
              created_at: c.created_at,
              post_id: c.post_id,
              post_title: c.post.title
            }
          end

        render json: {
          id: @user.id,
          name: @user.name,
          joined_at: @user.created_at,
          helpful_points: stat.helpful_points,
          comment_count: @user.comments.count,
          recent_comments: recent_comments
        }
      end

      private

      def set_user
        @user = User.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "User not found" }, status: :not_found
      end
    end
  end
end
