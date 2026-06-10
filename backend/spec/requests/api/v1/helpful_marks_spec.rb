require "rails_helper"

RSpec.describe "Api::V1::HelpfulMarks", type: :request do
  let!(:op) { User.create!(name: "Alice", email: "alice@example.com", password: "password123") }
  let!(:commenter) { User.create!(name: "Bob", email: "bob@example.com", password: "password123") }
  let!(:stranger) { User.create!(name: "Cara", email: "cara@example.com", password: "password123") }
  let!(:post_record) { op.posts.create!(title: "My problem", body: "It is really bad.") }
  let!(:comment) { post_record.comments.create!(body: "Here to help", user: commenter) }

  describe "POST /api/v1/posts/:post_id/helpful_mark" do
    it "marks the post helpful and returns the new count" do
      post "/api/v1/posts/#{post_record.id}/helpful_mark", headers: auth_headers_for(stranger), as: :json
      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body["helpful_count"]).to eq(1)
      expect(body["viewer_marked"]).to be(true)
    end

    it "is idempotent — marking twice keeps one mark" do
      2.times do
        post "/api/v1/posts/#{post_record.id}/helpful_mark", headers: auth_headers_for(stranger), as: :json
      end
      expect(post_record.helpful_marks.count).to eq(1)
    end

    it "requires authentication" do
      post "/api/v1/posts/#{post_record.id}/helpful_mark", as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 404 for an unknown post" do
      post "/api/v1/posts/999999/helpful_mark", headers: auth_headers_for(stranger), as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "DELETE /api/v1/posts/:post_id/helpful_mark" do
    it "removes the viewer's mark" do
      post_record.helpful_marks.create!(user: stranger)
      delete "/api/v1/posts/#{post_record.id}/helpful_mark", headers: auth_headers_for(stranger), as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["helpful_count"]).to eq(0)
      expect(body["viewer_marked"]).to be(false)
    end
  end

  describe "POST /api/v1/comments/:comment_id/helpful_mark" do
    it "marks the comment helpful" do
      post "/api/v1/comments/#{comment.id}/helpful_mark", headers: auth_headers_for(stranger), as: :json
      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)["helpful_count"]).to eq(1)
    end

    context "reputation rule" do
      it "awards a helpful point only when the OP marks the comment" do
        post "/api/v1/comments/#{comment.id}/helpful_mark", headers: auth_headers_for(op), as: :json
        expect(UserStat.for_user(commenter).helpful_points).to eq(1)
      end

      it "does not award points for non-OP marks" do
        post "/api/v1/comments/#{comment.id}/helpful_mark", headers: auth_headers_for(stranger), as: :json
        expect(UserStat.for_user(commenter).helpful_points).to eq(0)
      end

      it "revokes the point when the OP unmarks" do
        post "/api/v1/comments/#{comment.id}/helpful_mark", headers: auth_headers_for(op), as: :json
        delete "/api/v1/comments/#{comment.id}/helpful_mark", headers: auth_headers_for(op), as: :json
        expect(UserStat.for_user(commenter).helpful_points).to eq(0)
      end
    end
  end

  describe "helpful counts in post JSON" do
    it "includes helpful_count and viewer_marked on posts and comments" do
      post_record.helpful_marks.create!(user: stranger)
      comment.helpful_marks.create!(user: stranger)

      get "/api/v1/posts", headers: auth_headers_for(stranger), as: :json
      body = JSON.parse(response.body).first
      expect(body["helpful_count"]).to eq(1)
      expect(body["viewer_marked"]).to be(true)
      expect(body["comments"].first["helpful_count"]).to eq(1)
      expect(body["comments"].first["viewer_marked"]).to be(true)
    end

    it "defaults viewer_marked to false for anonymous readers" do
      post_record.helpful_marks.create!(user: stranger)
      get "/api/v1/posts", as: :json
      body = JSON.parse(response.body).first
      expect(body["helpful_count"]).to eq(1)
      expect(body["viewer_marked"]).to be(false)
    end
  end
end
