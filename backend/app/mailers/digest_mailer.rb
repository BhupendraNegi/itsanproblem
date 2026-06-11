# The email half of notifications: posters can't find their own anonymous
# posts in the feed, so the digest is their way back.
class DigestMailer < ApplicationMailer
  def daily(user, notifications)
    @user = user
    @notifications = notifications
    @reply_count = notifications.count { |n| n.event == "reply" }
    @helpful_count = notifications.count { |n| n.event == "helpful_mark" }
    @app_url = ENV.fetch("APP_URL", "http://localhost:3001")

    mail to: user.email, subject: digest_subject
  end

  private

  def digest_subject
    parts = []
    parts << "#{@reply_count} new #{"reply".pluralize(@reply_count)}" if @reply_count.positive?
    parts << "#{@helpful_count} helpful #{"mark".pluralize(@helpful_count)}" if @helpful_count.positive?
    "it's an problem — #{parts.join(" and ")}"
  end
end
