require 'rails_helper'

RSpec.describe "Api::V1::Posts", type: :request do
  let!(:user) { User.create!(name: "Alice", email: "alice@example.com", password: "password123") }
  let!(:post_record) { user.posts.create!(title: "My problem", body: "It is really bad.") }

  describe "GET /api/v1/posts" do
    it "returns all posts ordered newest first" do
      get "/api/v1/posts", as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to be_an(Array)
      expect(body.first["title"]).to eq("My problem")
    end

    it "hides user identity — author is Anonymous" do
      get "/api/v1/posts", as: :json
      body = JSON.parse(response.body)
      expect(body.first["author"]).to eq("Anonymous")
      expect(body.first.keys).not_to include("user_id")
    end

    it "includes comments nested in each post" do
      commenter = User.create!(name: "Bob", email: "bob@example.com", password: "password123")
      post_record.comments.create!(body: "Here to help", user: commenter)

      get "/api/v1/posts", as: :json
      comments = JSON.parse(response.body).first["comments"]
      expect(comments.length).to eq(1)
      expect(comments.first["author"]).to eq("Bob")
    end
  end

  describe "GET /api/v1/posts/:id" do
    it "returns the requested post" do
      get "/api/v1/posts/#{post_record.id}", as: :json
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["title"]).to eq("My problem")
    end

    it "returns 404 for an unknown post" do
      get "/api/v1/posts/999999", as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/posts" do
    let(:valid_params) { { post: { title: "New problem", body: "Details here." } } }

    context "when authenticated" do
      it "creates a post and returns it" do
        post "/api/v1/posts", params: valid_params, headers: auth_headers_for(user), as: :json
        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body["title"]).to eq("New problem")
        expect(body["author"]).to eq("Anonymous")
      end

      it "returns errors for missing title" do
        post "/api/v1/posts", params: { post: { body: "Details." } }, headers: auth_headers_for(user), as: :json
        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)["errors"]).to be_present
      end
    end

    context "when not authenticated" do
      it "returns 401" do
        post "/api/v1/posts", params: valid_params, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
