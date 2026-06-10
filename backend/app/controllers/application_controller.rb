class ApplicationController < ActionController::API
  attr_reader :current_user

  private

  def authenticate_user!
    token = request.headers["Authorization"]&.split(" ")&.last
    return render json: {error: "Missing Authorization token"}, status: :unauthorized unless token

    payload = decode_token(token)
    @current_user = User.find(payload["user_id"])
  rescue JWT::DecodeError, ActiveRecord::RecordNotFound, JWT::ExpiredSignature
    render json: {error: "Not authorized"}, status: :unauthorized
  end

  # Like authenticate_user!, but anonymous access is fine — used by public
  # endpoints that personalize output (e.g. viewer_marked) when a token is sent.
  def set_current_user
    token = request.headers["Authorization"]&.split(" ")&.last
    return unless token

    payload = decode_token(token)
    @current_user = User.find(payload["user_id"])
  rescue JWT::DecodeError, ActiveRecord::RecordNotFound, JWT::ExpiredSignature
    @current_user = nil
  end

  def encode_token(payload)
    JWT.encode(payload.merge(exp: 24.hours.from_now.to_i), jwt_secret)
  end

  def decode_token(token)
    JWT.decode(token, jwt_secret, true, algorithm: "HS256")[0]
  end

  def jwt_secret
    ENV["JWT_SECRET_KEY"] || Rails.application.secret_key_base
  end
end
