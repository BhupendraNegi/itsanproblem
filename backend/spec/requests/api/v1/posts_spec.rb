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

    it "hides user identity on anonymous posts" do
      user.posts.create!(title: "Secret", body: "Hush.", anonymous: true)
      get "/api/v1/posts", as: :json
      body = JSON.parse(response.body)
      anon = body.find { |p| p["title"] == "Secret" }
      expect(anon["author"]).to eq("Anonymous")
      expect(anon["author_id"]).to be_nil
      expect(anon.keys).not_to include("user_id")
    end

    it "shows the author on named posts" do
      get "/api/v1/posts", as: :json
      named = JSON.parse(response.body).find { |p| p["title"] == "My problem" }
      expect(named["author"]).to eq("Alice")
      expect(named["author_username"]).to eq(user.username)
    end

    context "search" do
      it "matches title and body case-insensitively" do
        user.posts.create!(title: "Roommate drama", body: "He never cleans.")
        user.posts.create!(title: "Other thing", body: "My ROOMMATE is loud.")
        user.posts.create!(title: "Unrelated", body: "Nothing here.")

        get "/api/v1/posts?q=roommate"
        titles = JSON.parse(response.body).pluck("title")
        expect(titles).to contain_exactly("Roommate drama", "Other thing")
      end

      it "treats LIKE wildcards as literals" do
        user.posts.create!(title: "100% stuck", body: "x")
        get "/api/v1/posts?q=100%25"
        expect(JSON.parse(response.body).pluck("title")).to eq(["100% stuck"])
      end

      it "composes with a tag filter" do
        money = Tag.create!(name: "Money", slug: "money")
        user.posts.create!(title: "Rent problem", body: "x", tag: money)
        user.posts.create!(title: "Rent problem untagged", body: "x")

        get "/api/v1/posts?q=rent&tag=money"
        expect(JSON.parse(response.body).pluck("title")).to eq(["Rent problem"])
      end
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
      it "creates a named post by default" do
        post "/api/v1/posts", params: valid_params, headers: auth_headers_for(user), as: :json
        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body["title"]).to eq("New problem")
        expect(body["author"]).to eq("Alice")
        expect(body["anonymous"]).to be(false)
      end

      it "creates an anonymous post when asked" do
        post "/api/v1/posts", params: {post: {title: "Quiet one", body: "Shh.", anonymous: true}},
          headers: auth_headers_for(user), as: :json
        body = JSON.parse(response.body)
        expect(body["author"]).to eq("Anonymous")
        expect(body["anonymous"]).to be(true)
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
