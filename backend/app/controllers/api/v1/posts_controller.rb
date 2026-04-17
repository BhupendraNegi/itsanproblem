module Api
  module V1
    class PostsController < ApplicationController
      before_action :authenticate_user!, only: [:create]
      before_action :set_post, only: [:show]

      def index
        posts = Post.includes(:comments, :user).order(created_at: :desc)
        render json: posts.map(&:as_json)
      end

      def show
        render json: @post.as_json
      end

      def create
        post = current_user.posts.build(post_params)

        if post.save
          render json: post.as_json, status: :created
        else
          render json: { errors: post.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_post
        @post = Post.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Post not found" }, status: :not_found
      end

      def post_params
        params.require(:post).permit(:title, :body)
      end
    end
  end
end
