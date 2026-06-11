module Api
  module V1
    module Admin
      class UsersController < BaseController
        before_action :set_user, except: [:index]

        def index
          users = User.order(:id)
          if params[:q].present?
            term = "%#{User.sanitize_sql_like(params[:q])}%"
            users = users.where("name LIKE :q OR email LIKE :q OR username LIKE :q", q: term)
          end

          render json: users.limit(100).map { |user| user_entry(user) }
        end

        def role
          authorize! @user, to: :update_role?

          if User.roles.key?(params[:role].to_s)
            @user.update!(role: params[:role])
            render json: user_entry(@user)
          else
            render json: {error: "Unknown role"}, status: :unprocessable_content
          end
        end

        def impersonate
          authorize! @user, to: :impersonate?

          Impersonation.create!(admin: current_user, user: @user)
          token = encode_token(user_id: @user.id, impersonator_id: current_user.id)
          render json: {
            user: @user.slice(:id, :name, :username, :email, :role),
            token: token
          }
        end

        def destroy
          authorize! @user, to: :destroy?
          @user.destroy!
          render json: {deleted: true}
        end

        private

        def set_user
          @user = User.find(params[:id])
        rescue ActiveRecord::RecordNotFound
          render json: {error: "User not found"}, status: :not_found
        end

        def user_entry(user)
          {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            joined_at: user.created_at,
            post_count: user.posts.count,
            comment_count: user.comments.count
          }
        end
      end
    end
  end
end
