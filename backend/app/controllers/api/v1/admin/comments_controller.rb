module Api
  module V1
    module Admin
      class CommentsController < BaseController
        before_action :set_comment

        def restore
          authorize! @comment, to: :restore?
          @comment.flags.destroy_all
          @comment.update!(hidden_at: nil)
          render json: {restored: true}
        end

        def destroy
          authorize! @comment, to: :destroy?
          @comment.destroy!
          render json: {deleted: true}
        end

        private

        def set_comment
          @comment = Comment.find(params[:id])
        rescue ActiveRecord::RecordNotFound
          render json: {error: "Comment not found"}, status: :not_found
        end
      end
    end
  end
end
