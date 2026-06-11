# Sends the daily digest to every opted-in user with notifications they
# haven't seen in-app or been emailed about. Scheduled in config/recurring.yml.
class DigestJob < ApplicationJob
  queue_as :default

  def perform
    User.where(email_digest_enabled: true)
      .joins(:notifications)
      .merge(Notification.pending_digest)
      .distinct
      .find_each do |user|
        notifications = user.notifications.pending_digest.includes(:post).to_a
        next if notifications.empty?

        DigestMailer.daily(user, notifications).deliver_now
        Notification.where(id: notifications.map(&:id)).update_all(digested_at: Time.current)
      end
  end
end
