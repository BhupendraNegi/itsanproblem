class PasswordMailer < ApplicationMailer
  def reset(user, token)
    @user = user
    @reset_url = "#{ENV.fetch("APP_URL", "http://localhost:3001")}/reset-password?token=#{token}"
    mail to: user.email, subject: "it's an problem — reset your password"
  end
end
