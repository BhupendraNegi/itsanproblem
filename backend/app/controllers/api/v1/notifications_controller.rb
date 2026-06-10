module Api
  module V1
    class NotificationsController < ApplicationController
      before_action :authenticate_user!

      def index
        notifications = current_user.notifications.includes(:post).order(created_at: :desc).limit(20)
        render json: {
          notifications: notifications.map(&:as_json),
          unread_count: current_user.notifications.unread.count
        }
      end

      def read_all
        current_user.notifications.unread.update_all(read_at: Time.current)
        render json: {unread_count: 0}
      end
    end
  end
end
