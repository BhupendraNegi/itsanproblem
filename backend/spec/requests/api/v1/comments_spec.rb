require "rails_helper"

RSpec.describe "Api::V1::Comments", type: :request do
  let!(:author) { User.create!(name: "Alice", email: "alice@example.com", password: "password123") }
  let!(:commenter) { User.create!(name: "Bob", email: "bob@example.com", password: "password123") }
  let!(:post_record) { author.posts.create!(title: "My problem", body: "It is bad.") }

  describe "POST /api/v1/posts/:post_id/comments" do
    let(:valid_params) { {comment: {body: "Have you tried turning it off?"}} }

    context "when authenticated" do
      it "creates a comment and returns it" do
        post "/api/v1/posts/#{post_record.id}/comments",
          params: valid_params,
          headers: auth_headers_for(commenter),
          as: :json

        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body["body"]).to eq("Have you tried turning it off?")
        expect(body["author"]).to eq("Bob")
        expect(body["author_id"]).to eq(commenter.id)
      end

      it "creates an anonymous comment that hides the identity" do
        post "/api/v1/posts/#{post_record.id}/comments",
          params: {comment: {body: "Been through this too.", anonymous: true}},
          headers: auth_headers_for(commenter),
          as: :json

        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body["author"]).to eq("Anonymous")
        expect(body["author_id"]).to be_nil
        expect(body["op"]).to be(false)
        # authorship is still recorded server-side
        expect(Comment.last.user_id).to eq(commenter.id)
      end

      it "awards no helpful points for OP marks on anonymous comments" do
        post "/api/v1/posts/#{post_record.id}/comments",
          params: {comment: {body: "Anon advice", anonymous: true}},
          headers: auth_headers_for(commenter), as: :json
        comment = Comment.last

        post "/api/v1/comments/#{comment.id}/helpful_mark", headers: auth_headers_for(author), as: :json
        expect(UserStat.for_user(commenter).helpful_points).to eq(0)
      end

      it "returns errors for a blank body" do
        post "/api/v1/posts/#{post_record.id}/comments",
          params: {comment: {body: ""}},
          headers: auth_headers_for(commenter),
          as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body)["errors"]).to be_present
      end

      it "returns 404 for an unknown post" do
        post "/api/v1/posts/999999/comments",
          params: valid_params,
          headers: auth_headers_for(commenter),
          as: :json

        expect(response).to have_http_status(:not_found)
      end
    end

    context "when not authenticated" do
      it "returns 401" do
        post "/api/v1/posts/#{post_record.id}/comments", params: valid_params, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
