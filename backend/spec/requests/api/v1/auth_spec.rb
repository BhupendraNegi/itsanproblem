require "rails_helper"

RSpec.describe "Api::V1::Auth", type: :request do
  describe "POST /api/v1/auth/register" do
    let(:valid_params) do
      {user: {name: "Alice", email: "alice@example.com", password: "password123", password_confirmation: "password123"}}
    end

    it "creates a user and returns a token" do
      post "/api/v1/auth/register", params: valid_params, as: :json
      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body["token"]).to be_present
      expect(body["user"]["name"]).to eq("Alice")
      expect(body["user"]["email"]).to eq("alice@example.com")
      expect(body["user"].keys).not_to include("encrypted_password")
    end

    it "auto-generates a username and returns it" do
      post "/api/v1/auth/register", params: valid_params, as: :json
      expect(JSON.parse(response.body)["user"]["username"]).to eq("alice")
    end

    it "accepts a chosen username" do
      params = {user: valid_params[:user].merge(username: "Wise_Owl")}
      post "/api/v1/auth/register", params: params, as: :json
      expect(JSON.parse(response.body)["user"]["username"]).to eq("wise_owl")
    end

    it "rejects a taken username" do
      User.create!(name: "Z", email: "z@example.com", password: "password123", username: "wise_owl")
      params = {user: valid_params[:user].merge(username: "wise_owl")}
      post "/api/v1/auth/register", params: params, as: :json
      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)["errors"].join).to match(/username/i)
    end

    it "always creates a member — a role in the payload is ignored" do
      params = {user: valid_params[:user].merge(role: "admin")}
      post "/api/v1/auth/register", params: params, as: :json
      expect(response).to have_http_status(:created)
      expect(User.find_by(email: "alice@example.com").role).to eq("member")
    end

    it "returns errors for missing name" do
      post "/api/v1/auth/register", params: {user: {email: "alice@example.com", password: "password123", password_confirmation: "password123"}}, as: :json
      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)["errors"]).to be_present
    end

    it "returns errors for duplicate email" do
      User.create!(name: "Alice", email: "alice@example.com", password: "password123")
      post "/api/v1/auth/register", params: valid_params, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "returns errors for mismatched password confirmation" do
      post "/api/v1/auth/register", params: {user: {name: "Alice", email: "alice@example.com", password: "password123", password_confirmation: "wrong"}}, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "password reset" do
    let!(:user) { User.create!(name: "Alice", email: "alice@example.com", password: "password123") }

    before { ActionMailer::Base.deliveries.clear }

    it "emails a reset link for a known email" do
      post "/api/v1/auth/forgot_password", params: {email: "alice@example.com"}, as: :json
      expect(response).to have_http_status(:ok)
      mail = ActionMailer::Base.deliveries.last
      expect(mail.to).to eq(["alice@example.com"])
      expect(mail.text_part.body.to_s).to include("/reset-password?token=")
    end

    it "returns the same success for unknown emails without sending" do
      post "/api/v1/auth/forgot_password", params: {email: "ghost@example.com"}, as: :json
      expect(response).to have_http_status(:ok)
      expect(ActionMailer::Base.deliveries).to be_empty
    end

    it "resets the password with a valid token" do
      post "/api/v1/auth/forgot_password", params: {email: "alice@example.com"}, as: :json
      token = ActionMailer::Base.deliveries.last.text_part.body.to_s[/token=([\w-]+)/, 1]

      post "/api/v1/auth/reset_password",
        params: {token: token, password: "newpassword456", password_confirmation: "newpassword456"}, as: :json

      expect(response).to have_http_status(:ok)
      expect(user.reload.valid_password?("newpassword456")).to be(true)
      expect(user.reset_password_token).to be_nil
    end

    it "rejects an invalid token" do
      post "/api/v1/auth/reset_password",
        params: {token: "bogus", password: "newpassword456", password_confirmation: "newpassword456"}, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "rejects an expired token" do
      post "/api/v1/auth/forgot_password", params: {email: "alice@example.com"}, as: :json
      token = ActionMailer::Base.deliveries.last.text_part.body.to_s[/token=([\w-]+)/, 1]
      user.update!(reset_password_sent_at: 7.hours.ago)

      post "/api/v1/auth/reset_password",
        params: {token: token, password: "newpassword456", password_confirmation: "newpassword456"}, as: :json
      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)["error"]).to match(/expired/i)
    end
  end

  describe "POST /api/v1/auth/login" do
    let!(:user) { User.create!(name: "Alice", email: "alice@example.com", password: "password123") }

    it "returns a token on valid credentials" do
      post "/api/v1/auth/login", params: {email: "alice@example.com", password: "password123"}, as: :json
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["token"]).to be_present
    end

    it "returns 401 on wrong password" do
      post "/api/v1/auth/login", params: {email: "alice@example.com", password: "wrong"}, as: :json
      expect(response).to have_http_status(:unauthorized)
      expect(JSON.parse(response.body)["error"]).to be_present
    end

    it "returns 401 for unknown email" do
      post "/api/v1/auth/login", params: {email: "nobody@example.com", password: "password123"}, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /api/v1/auth/logout" do
    it "returns success" do
      delete "/api/v1/auth/logout", as: :json
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["success"]).to be true
    end
  end
end
