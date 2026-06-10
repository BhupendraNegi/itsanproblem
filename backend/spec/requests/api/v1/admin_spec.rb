require "rails_helper"

RSpec.describe "Api::V1::Admin", type: :request do
  let!(:admin) { User.create!(name: "Root", email: "root@example.com", password: "password123", role: "admin") }
  let!(:member) { User.create!(name: "Alice", email: "alice@example.com", password: "password123") }
  let!(:post_record) { member.posts.create!(title: "My problem", body: "It is bad.") }

  describe "authorization" do
    it "rejects non-admins with 403" do
      get "/api/v1/admin/stats", headers: auth_headers_for(member), as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it "rejects unauthenticated requests with 401" do
      get "/api/v1/admin/stats", as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/admin/stats" do
    it "returns site totals" do
      get "/api/v1/admin/stats", headers: auth_headers_for(admin), as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to include("users" => 2, "posts" => 1, "comments" => 0, "flags" => 0)
    end
  end

  describe "GET /api/v1/admin/flags (moderation queue)" do
    it "lists flagged content with reasons" do
      flagger = User.create!(name: "F", email: "f@example.com", password: "password123")
      post_record.flags.create!(user: flagger, reason: "spam")

      get "/api/v1/admin/flags", headers: auth_headers_for(admin), as: :json
      body = JSON.parse(response.body)
      expect(body["posts"].first).to include("title" => "My problem", "flag_count" => 1, "hidden" => false)
      expect(body["posts"].first["reasons"]).to eq("spam" => 1)
    end
  end

  describe "PATCH /api/v1/admin/posts/:id/restore" do
    it "unhides the post and clears its flags" do
      3.times do |n|
        flagger = User.create!(name: "F#{n}", email: "f#{n}@example.com", password: "password123")
        post_record.flags.create!(user: flagger, reason: "harm")
      end
      expect(post_record.reload.hidden_at).to be_present

      patch "/api/v1/admin/posts/#{post_record.id}/restore", headers: auth_headers_for(admin), as: :json
      expect(response).to have_http_status(:ok)
      expect(post_record.reload.hidden_at).to be_nil
      expect(post_record.flags.count).to eq(0)
    end
  end

  describe "DELETE /api/v1/admin/posts/:id" do
    it "removes the post" do
      delete "/api/v1/admin/posts/#{post_record.id}", headers: auth_headers_for(admin), as: :json
      expect(response).to have_http_status(:ok)
      expect(Post.exists?(post_record.id)).to be(false)
    end
  end

  describe "GET /api/v1/admin/users" do
    it "lists users with roles and counts" do
      get "/api/v1/admin/users", headers: auth_headers_for(admin), as: :json
      body = JSON.parse(response.body)
      expect(body.length).to eq(2)
      alice = body.find { |u| u["name"] == "Alice" }
      expect(alice).to include("role" => "member", "post_count" => 1)
    end

    it "filters by search term" do
      get "/api/v1/admin/users?q=alice", headers: auth_headers_for(admin), as: :json
      body = JSON.parse(response.body)
      expect(body.length).to eq(1)
      expect(body.first["name"]).to eq("Alice")
    end
  end

  describe "PATCH /api/v1/admin/users/:id/role" do
    it "promotes a member to admin" do
      patch "/api/v1/admin/users/#{member.id}/role", params: {role: "admin"},
        headers: auth_headers_for(admin), as: :json
      expect(response).to have_http_status(:ok)
      expect(member.reload.role).to eq("admin")
    end

    it "refuses to change your own role" do
      patch "/api/v1/admin/users/#{admin.id}/role", params: {role: "member"},
        headers: auth_headers_for(admin), as: :json
      expect(response).to have_http_status(:forbidden)
      expect(admin.reload.role).to eq("admin")
    end

    it "rejects unknown roles" do
      patch "/api/v1/admin/users/#{member.id}/role", params: {role: "supreme"},
        headers: auth_headers_for(admin), as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "POST /api/v1/admin/users/:id/impersonate" do
    it "returns a working token for the target user and records an audit row" do
      post "/api/v1/admin/users/#{member.id}/impersonate", headers: auth_headers_for(admin), as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["user"]["id"]).to eq(member.id)

      audit = Impersonation.last
      expect(audit.admin).to eq(admin)
      expect(audit.user).to eq(member)

      # The issued token authenticates as the member.
      get "/api/v1/users/#{member.id}", headers: {"Authorization" => "Bearer #{body["token"]}"}, as: :json
      expect(JSON.parse(response.body)).to have_key("posts")
    end

    it "refuses to impersonate yourself" do
      post "/api/v1/admin/users/#{admin.id}/impersonate", headers: auth_headers_for(admin), as: :json
      expect(response).to have_http_status(:forbidden)
      expect(Impersonation.count).to eq(0)
    end
  end

  describe "DELETE /api/v1/admin/users/:id" do
    it "deletes the user and their posts" do
      delete "/api/v1/admin/users/#{member.id}", headers: auth_headers_for(admin), as: :json
      expect(response).to have_http_status(:ok)
      expect(User.exists?(member.id)).to be(false)
      expect(Post.exists?(post_record.id)).to be(false)
    end

    it "refuses to delete yourself" do
      delete "/api/v1/admin/users/#{admin.id}", headers: auth_headers_for(admin), as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end
end
