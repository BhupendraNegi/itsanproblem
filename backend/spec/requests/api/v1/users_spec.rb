require "rails_helper"

RSpec.describe "Api::V1::Users", type: :request do
  let!(:user) { User.create!(name: "Alice", email: "alice@example.com", password: "password123") }

  describe "GET /api/v1/users/:id" do
    context "when authenticated" do
      it "returns the user profile" do
        get "/api/v1/users/#{user.id}", headers: auth_headers_for(user), as: :json
        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["name"]).to eq("Alice")
        expect(body["helpful_points"]).to eq(0)
        expect(body["comment_count"]).to eq(0)
        expect(body["recent_comments"]).to eq([])
      end

      it "includes recent comments with post title" do
        post_record = user.posts.create!(title: "My problem", body: "It is bad.")
        commenter = User.create!(name: "Bob", email: "bob@example.com", password: "password123")
        post_record.comments.create!(body: "Hang in there.", user: commenter)

        get "/api/v1/users/#{commenter.id}", headers: auth_headers_for(user), as: :json
        body = JSON.parse(response.body)
        expect(body["comment_count"]).to eq(1)
        expect(body["recent_comments"].first["body"]).to eq("Hang in there.")
        expect(body["recent_comments"].first["post_title"]).to eq("My problem")
      end

      it "includes the bio" do
        user.update!(bio: "Just here to help.")
        get "/api/v1/users/#{user.id}", headers: auth_headers_for(user), as: :json
        expect(JSON.parse(response.body)["bio"]).to eq("Just here to help.")
      end

      it "shows your own anonymous posts only to you" do
        post_record = user.posts.create!(title: "My secret problem", body: "Don't tell.")
        other = User.create!(name: "Eve", email: "eve@example.com", password: "password123")

        get "/api/v1/users/#{user.id}", headers: auth_headers_for(user), as: :json
        own = JSON.parse(response.body)["posts"]
        expect(own.first).to include("title" => "My secret problem", "anon_handle" => post_record.anon_handle)

        get "/api/v1/users/#{user.id}", headers: auth_headers_for(other), as: :json
        expect(JSON.parse(response.body)).not_to have_key("posts")
      end

      it "does not expose email or encrypted_password" do
        get "/api/v1/users/#{user.id}", headers: auth_headers_for(user), as: :json
        body = JSON.parse(response.body)
        expect(body.keys).not_to include("email", "encrypted_password")
      end

      it "returns 404 for an unknown user" do
        get "/api/v1/users/999999", headers: auth_headers_for(user), as: :json
        expect(response).to have_http_status(:not_found)
      end
    end

    context "when not authenticated" do
      it "returns 401" do
        get "/api/v1/users/#{user.id}", as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
