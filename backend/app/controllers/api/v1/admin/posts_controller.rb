module Api
  module V1
    module Admin
      class PostsController < BaseController
        before_action :set_post

        # Unhide and clear flags so the auto-hide threshold starts fresh.
        def restore
          authorize! @post, to: :restore?
          @post.flags.destroy_all
          @post.update!(hidden_at: nil)
          render json: {restored: true}
        end

        def destroy
          authorize! @post, to: :destroy?
          @post.destroy!
          render json: {deleted: true}
        end

        private

        def set_post
          @post = Post.find(params[:id])
        rescue ActiveRecord::RecordNotFound
          render json: {error: "Post not found"}, status: :not_found
        end
      end
    end
  end
end
