module Api
  module V1
    class AuthController < ApplicationController
      def register
        user = User.new(register_params)
        # Public registration always creates members. Admins are made only by
        # promotion in the admin dashboard (PATCH /admin/users/:id/role).
        user.role = :member

        if user.save
          render json: {user: user_response(user), token: encode_token(user_id: user.id)}, status: :created
        else
          render json: {errors: user.errors.full_messages}, status: :unprocessable_content
        end
      end

      def login
        user = User.find_for_database_authentication(email: params[:email])

        if user&.valid_password?(params[:password])
          render json: {user: user_response(user), token: encode_token(user_id: user.id)}
        else
          render json: {error: "Invalid email or password"}, status: :unauthorized
        end
      end

      def logout
        render json: {success: true}
      end

      def forgot_password
        user = User.find_by(email: params[:email].to_s.strip.downcase)
        if user
          raw, hashed = Devise.token_generator.generate(User, :reset_password_token)
          user.update!(reset_password_token: hashed, reset_password_sent_at: Time.current)
          PasswordMailer.reset(user, raw).deliver_now
        end
        # Always succeed so the endpoint can't be used to probe which emails exist.
        render json: {success: true}
      end

      def reset_password
        hashed = Devise.token_generator.digest(User, :reset_password_token, params[:token].to_s)
        user = User.find_by(reset_password_token: hashed)

        if user.nil? || user.reset_password_sent_at.nil? || user.reset_password_sent_at < 6.hours.ago
          return render json: {error: "That reset link is invalid or has expired"}, status: :unprocessable_content
        end

        if user.update(password: params[:password], password_confirmation: params[:password_confirmation])
          user.update!(reset_password_token: nil, reset_password_sent_at: nil)
          render json: {success: true}
        else
          render json: {errors: user.errors.full_messages}, status: :unprocessable_content
        end
      end

      private

      def register_params
        params.require(:user).permit(:name, :username, :email, :password, :password_confirmation)
      end

      def user_response(user)
        user.slice(:id, :name, :username, :email, :role)
      end
    end
  end
end
