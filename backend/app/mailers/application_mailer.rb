class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("MAIL_FROM", "no-reply@itsanproblem.test")
  layout "mailer"
end
