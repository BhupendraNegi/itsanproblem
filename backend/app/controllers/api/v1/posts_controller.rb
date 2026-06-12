module Api
  module V1
    class PostsController < ApplicationController
      before_action :authenticate_user!, only: [:create]
      before_action :set_current_user, only: [:index, :show]
      before_action :set_post, only: [:show]

      PER_PAGE = 10

      def index
        posts = Post.visible.includes({post_author: :user}, :tag, :helpful_marks, comments: [:user, :helpful_marks])
        if params[:tag].present?
          tag = Tag.find_by(slug: params[:tag])
          return render json: {error: "Unknown tag"}, status: :not_found unless tag
          posts = posts.where(tag_id: tag.id)
        end
        posts = (params[:sort] == "hot") ? posts.hot : posts.order(created_at: :desc)
        page = [params[:page].to_i, 1].max
        posts = posts.offset((page - 1) * PER_PAGE).limit(PER_PAGE)
        render json: posts.map { |post| post.as_json(viewer: current_user) }
      end

      def show
        render json: @post.as_json(viewer: current_user)
      end

      def create
        post = current_user.posts.build(post_params)

        if post.save
          render json: post.as_json, status: :created
        else
          render json: {errors: post.errors.full_messages}, status: :unprocessable_content
        end
      end

      private

      def set_post
        @post = Post.visible.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: {error: "Post not found"}, status: :not_found
      end

      def post_params
        params.require(:post).permit(:title, :body, :anonymous, :tag_id)
      end
    end
  end
end
