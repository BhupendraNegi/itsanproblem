module AuthHelper
  def auth_headers_for(user)
    secret = ENV["JWT_SECRET_KEY"] || Rails.application.secret_key_base
    payload = { user_id: user.id, exp: 24.hours.from_now.to_i }
    token = JWT.encode(payload, secret, "HS256")
    { "Authorization" => "Bearer #{token}" }
  end
end

RSpec.configure do |config|
  config.include AuthHelper, type: :request
end
