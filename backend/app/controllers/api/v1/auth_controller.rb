module Api
  module V1
    class AuthController < ApplicationController
      def register
        user = User.new(register_params)

        if user.save
          render json: { user: user_response(user), token: encode_token(user_id: user.id) }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def login
        user = User.find_for_database_authentication(email: params[:email])

        if user&.valid_password?(params[:password])
          render json: { user: user_response(user), token: encode_token(user_id: user.id) }
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def logout
        render json: { success: true }
      end

      private

      def register_params
        params.require(:user).permit(:name, :email, :password, :password_confirmation)
      end

      def user_response(user)
        user.slice(:id, :name, :email)
      end
    end
  end
end
