require "rails_helper"

RSpec.describe "Api::V1::Tags", type: :request do
  let!(:user) { User.create!(name: "Alice", email: "alice@example.com", password: "password123") }
  let!(:money) { Tag.create!(name: "Money", slug: "money") }
  let!(:career) { Tag.create!(name: "Career", slug: "career") }

  describe "GET /api/v1/tags" do
    it "lists tags with post counts" do
      user.posts.create!(title: "Rent is eating me alive", body: "Help.", tag: money)

      get "/api/v1/tags", as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.find { |t| t["slug"] == "money" }["post_count"]).to eq(1)
      expect(body.find { |t| t["slug"] == "career" }["post_count"]).to eq(0)
    end
  end

  describe "tagged posts" do
    it "creates a post with a tag and includes it in JSON" do
      post "/api/v1/posts", params: {post: {title: "Broke", body: "Very.", tag_id: money.id}},
        headers: auth_headers_for(user), as: :json
      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)["tag"]).to include("slug" => "money", "name" => "Money")
    end

    it "filters the feed by ?tag=slug" do
      user.posts.create!(title: "Tagged money", body: "x", tag: money)
      user.posts.create!(title: "Tagged career", body: "x", tag: career)
      user.posts.create!(title: "Untagged", body: "x")

      get "/api/v1/posts?tag=money"
      titles = JSON.parse(response.body).pluck("title")
      expect(titles).to eq(["Tagged money"])
    end

    it "404s an unknown tag filter" do
      get "/api/v1/posts?tag=nope"
      expect(response).to have_http_status(:not_found)
    end

    it "combines tag filter with hot sort" do
      tagged = user.posts.create!(title: "Hot money", body: "x", tag: money)
      fan = User.create!(name: "Fan", email: "fan@example.com", password: "password123")
      tagged.helpful_marks.create!(user: fan)

      get "/api/v1/posts?tag=money&sort=hot"
      expect(JSON.parse(response.body).pluck("title")).to eq(["Hot money"])
    end
  end
end
