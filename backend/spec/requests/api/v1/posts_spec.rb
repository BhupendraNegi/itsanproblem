require "rails_helper"

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

    context "pagination" do
      it "returns 10 posts per page" do
        12.times { |n| user.posts.create!(title: "Post #{n}", body: "Body") }

        get "/api/v1/posts"
        expect(JSON.parse(response.body).length).to eq(10)

        get "/api/v1/posts?page=2"
        # 12 new + 1 from setup = 13 total → 3 on page 2
        expect(JSON.parse(response.body).length).to eq(3)
      end
    end

    context "with ?sort=hot" do
      it "orders by helpful marks (last 7 days) instead of recency" do
        popular = user.posts.create!(title: "Older but loved", body: "Help me.", created_at: 2.days.ago)
        fan = User.create!(name: "Fan", email: "fan@example.com", password: "password123")
        popular.helpful_marks.create!(user: fan)

        get "/api/v1/posts?sort=hot"
        titles = JSON.parse(response.body).pluck("title")
        expect(titles.first).to eq("Older but loved")
      end

      it "excludes posts older than 7 days" do
        stale = user.posts.create!(title: "Ancient", body: "Old news.", created_at: 8.days.ago)
        fan = User.create!(name: "Fan", email: "fan@example.com", password: "password123")
        stale.helpful_marks.create!(user: fan)

        get "/api/v1/posts?sort=hot"
        titles = JSON.parse(response.body).pluck("title")
        expect(titles).not_to include("Ancient")
      end
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
    let(:valid_params) { {post: {title: "New problem", body: "Details here."}} }

    context "when authenticated" do
      it "creates a post and returns it" do
        post "/api/v1/posts", params: valid_params, headers: auth_headers_for(user), as: :json
        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body["title"]).to eq("New problem")
        expect(body["author"]).to eq("Anonymous")
      end

      it "returns errors for missing title" do
        post "/api/v1/posts", params: {post: {body: "Details."}}, headers: auth_headers_for(user), as: :json
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
