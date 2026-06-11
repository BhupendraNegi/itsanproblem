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

        profile = {
          id: @user.id,
          name: @user.name,
          username: @user.username,
          bio: @user.bio,
          joined_at: @user.created_at,
          helpful_points: stat.helpful_points,
          comment_count: @user.comments.count,
          recent_comments: recent_comments
        }

        # Only you can see your own anonymous posts — resolved through the
        # post_authors ledger, never exposed on anyone else's profile.
        if @user == current_user
          profile[:posts] = own_posts
          profile[:email_digest_enabled] = @user.email_digest_enabled
        end

        render json: profile
      end

      private

      def own_posts
        current_user.posts
          .includes(:comments, :helpful_marks)
          .order(created_at: :desc)
          .limit(20)
          .map do |post|
            {
              id: post.id,
              title: post.title,
              anon_handle: post.anon_handle,
              created_at: post.created_at,
              helpful_count: post.helpful_marks.size,
              comment_count: post.comments.size,
              hidden: post.hidden_at.present?
            }
          end
      end

      def set_user
        @user = User.find_by(username: params[:id])
        # Usernames can't be all digits, so numeric values are unambiguous —
        # keeps old /users/:id links working.
        @user ||= User.find_by(id: params[:id]) if /\A\d+\z/.match?(params[:id].to_s)
        render json: {error: "User not found"}, status: :not_found unless @user
      end
    end
  end
end
