require "rails_helper"

RSpec.describe "Api::V1::Profiles", type: :request do
  let!(:user) { User.create!(name: "Alice", email: "alice@example.com", password: "password123") }

  describe "PATCH /api/v1/profile" do
    it "updates name, email, and bio" do
      patch "/api/v1/profile",
        params: {user: {name: "Alice B", email: "aliceb@example.com", bio: "Helper."}},
        headers: auth_headers_for(user), as: :json

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to include("name" => "Alice B", "email" => "aliceb@example.com", "bio" => "Helper.")
      expect(user.reload.name).to eq("Alice B")
    end

    it "toggles the email digest preference" do
      patch "/api/v1/profile",
        params: {user: {email_digest_enabled: false}},
        headers: auth_headers_for(user), as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["email_digest_enabled"]).to be(false)
      expect(user.reload.email_digest_enabled).to be(false)
    end

    it "rejects invalid updates" do
      patch "/api/v1/profile",
        params: {user: {name: ""}}, headers: auth_headers_for(user), as: :json
      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)["errors"]).to be_present
    end

    it "requires authentication" do
      patch "/api/v1/profile", params: {user: {name: "X"}}, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "PATCH /api/v1/profile/password" do
    it "changes the password when the current password is correct" do
      patch "/api/v1/profile/password",
        params: {user: {current_password: "password123", password: "newpassword456", password_confirmation: "newpassword456"}},
        headers: auth_headers_for(user), as: :json

      expect(response).to have_http_status(:ok)
      expect(user.reload.valid_password?("newpassword456")).to be(true)
    end

    it "rejects a wrong current password" do
      patch "/api/v1/profile/password",
        params: {user: {current_password: "wrong", password: "newpassword456", password_confirmation: "newpassword456"}},
        headers: auth_headers_for(user), as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)["error"]).to match(/current password/i)
      expect(user.reload.valid_password?("password123")).to be(true)
    end

    it "rejects a mismatched confirmation" do
      patch "/api/v1/profile/password",
        params: {user: {current_password: "password123", password: "newpassword456", password_confirmation: "different"}},
        headers: auth_headers_for(user), as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
