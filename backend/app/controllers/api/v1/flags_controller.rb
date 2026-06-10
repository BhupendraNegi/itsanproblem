module Api
  module V1
    class FlagsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_flaggable

      def create
        flag = @flaggable.flags.find_or_initialize_by(user: current_user)
        flag.reason ||= params.require(:flag)[:reason]

        if flag.persisted? || flag.save
          render json: {flagged: true}, status: :created
        else
          render json: {errors: flag.errors.full_messages}, status: :unprocessable_content
        end
      end

      private

      def set_flaggable
        @flaggable =
          if params[:post_id]
            Post.find(params[:post_id])
          else
            Comment.find(params[:comment_id])
          end
      rescue ActiveRecord::RecordNotFound
        render json: {error: "Not found"}, status: :not_found
      end
    end
  end
end
