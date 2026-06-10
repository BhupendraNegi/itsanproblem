require "rails_helper"

RSpec.describe "Api::V1::Flags", type: :request do
  let!(:author) { User.create!(name: "Alice", email: "alice@example.com", password: "password123") }
  let!(:post_record) { author.posts.create!(title: "My problem", body: "It is really bad.") }
  let!(:reporter) { User.create!(name: "Rita", email: "rita@example.com", password: "password123") }

  def flagger(n)
    User.create!(name: "Flagger #{n}", email: "flagger#{n}@example.com", password: "password123")
  end

  describe "POST /api/v1/posts/:post_id/flag" do
    it "records a flag with a reason" do
      post "/api/v1/posts/#{post_record.id}/flag",
        params: {flag: {reason: "spam"}}, headers: auth_headers_for(reporter), as: :json
      expect(response).to have_http_status(:created)
      expect(post_record.flags.count).to eq(1)
    end

    it "is idempotent per user" do
      2.times do
        post "/api/v1/posts/#{post_record.id}/flag",
          params: {flag: {reason: "spam"}}, headers: auth_headers_for(reporter), as: :json
      end
      expect(post_record.flags.count).to eq(1)
    end

    it "rejects unknown reasons" do
      post "/api/v1/posts/#{post_record.id}/flag",
        params: {flag: {reason: "disagree"}}, headers: auth_headers_for(reporter), as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "requires authentication" do
      post "/api/v1/posts/#{post_record.id}/flag", params: {flag: {reason: "spam"}}, as: :json
      expect(response).to have_http_status(:unauthorized)
    end

    it "auto-hides the post after 3 distinct flags" do
      3.times do |n|
        post "/api/v1/posts/#{post_record.id}/flag",
          params: {flag: {reason: "harm"}}, headers: auth_headers_for(flagger(n)), as: :json
      end

      expect(post_record.reload.hidden_at).to be_present

      get "/api/v1/posts", as: :json
      expect(JSON.parse(response.body)).to be_empty

      get "/api/v1/posts/#{post_record.id}", as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/comments/:comment_id/flag" do
    let!(:comment) { post_record.comments.create!(body: "rude stuff", user: reporter) }

    it "auto-hides the comment after 3 distinct flags and drops it from post JSON" do
      3.times do |n|
        post "/api/v1/comments/#{comment.id}/flag",
          params: {flag: {reason: "harm"}}, headers: auth_headers_for(flagger(n)), as: :json
      end

      expect(comment.reload.hidden_at).to be_present

      get "/api/v1/posts/#{post_record.id}", as: :json
      expect(JSON.parse(response.body)["comments"]).to be_empty
    end
  end
end
