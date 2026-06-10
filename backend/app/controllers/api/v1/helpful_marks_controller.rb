module Api
  module V1
    class HelpfulMarksController < ApplicationController
      before_action :authenticate_user!
      before_action :set_markable

      def create
        mark = @markable.helpful_marks.find_or_create_by(user: current_user)
        if mark.persisted?
          render json: mark_state, status: :created
        else
          render json: {errors: mark.errors.full_messages}, status: :unprocessable_content
        end
      end

      def destroy
        @markable.helpful_marks.find_by(user: current_user)&.destroy
        render json: mark_state
      end

      private

      def set_markable
        @markable =
          if params[:post_id]
            Post.find(params[:post_id])
          else
            Comment.find(params[:comment_id])
          end
      rescue ActiveRecord::RecordNotFound
        render json: {error: "Not found"}, status: :not_found
      end

      def mark_state
        {
          helpful_count: @markable.helpful_marks.count,
          viewer_marked: @markable.helpful_marks.exists?(user: current_user)
        }
      end
    end
  end
end
