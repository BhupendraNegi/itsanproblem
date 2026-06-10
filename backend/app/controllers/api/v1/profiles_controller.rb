module Api
  module V1
    class ProfilesController < ApplicationController
      before_action :authenticate_user!

      def update
        if current_user.update(profile_params)
          render json: current_user.slice(:id, :name, :email, :bio)
        else
          render json: {errors: current_user.errors.full_messages}, status: :unprocessable_content
        end
      end

      def password
        unless current_user.valid_password?(password_params[:current_password].to_s)
          return render json: {error: "Current password is incorrect"}, status: :unprocessable_content
        end

        if current_user.update(password_params.slice(:password, :password_confirmation))
          render json: {success: true}
        else
          render json: {errors: current_user.errors.full_messages}, status: :unprocessable_content
        end
      end

      private

      def profile_params
        params.require(:user).permit(:name, :email, :bio)
      end

      def password_params
        params.require(:user).permit(:current_password, :password, :password_confirmation)
      end
    end
  end
end
