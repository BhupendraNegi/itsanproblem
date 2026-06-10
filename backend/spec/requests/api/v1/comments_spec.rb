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
