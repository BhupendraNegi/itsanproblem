require "rails_helper"

RSpec.describe "Api::V1::Notifications", type: :request do
  let!(:op) { User.create!(name: "Alice", email: "alice@example.com", password: "password123") }
  let!(:commenter) { User.create!(name: "Bob", email: "bob@example.com", password: "password123") }
  let!(:post_record) { op.posts.create!(title: "My problem", body: "It is really bad.") }

  describe "notification creation" do
    it "notifies the OP when someone replies to their post" do
      post_record.comments.create!(body: "Here to help", user: commenter)

      notification = op.notifications.last
      expect(notification.event).to eq("reply")
      expect(notification.post_id).to eq(post_record.id)
    end

    it "does not notify the OP about their own reply" do
      post_record.comments.create!(body: "Adding context", user: op)
      expect(op.notifications).to be_empty
    end

    it "notifies the commenter when their reply earns a helpful mark" do
      comment = post_record.comments.create!(body: "Here to help", user: commenter)
      comment.helpful_marks.create!(user: op)

      notification = commenter.notifications.last
      expect(notification.event).to eq("helpful_mark")
      expect(notification.post_id).to eq(post_record.id)
    end

    it "does not notify when marking your own comment" do
      comment = post_record.comments.create!(body: "Self five", user: commenter)
      comment.helpful_marks.create!(user: commenter)
      expect(commenter.notifications).to be_empty
    end
  end

  describe "GET /api/v1/notifications" do
    before { post_record.comments.create!(body: "Here to help", user: commenter) }

    it "returns the user's notifications with unread count" do
      get "/api/v1/notifications", headers: auth_headers_for(op), as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["unread_count"]).to eq(1)
      expect(body["notifications"].first).to include(
        "event" => "reply",
        "post_title" => "My problem",
        "read" => false
      )
    end

    it "requires authentication" do
      get "/api/v1/notifications", as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "PATCH /api/v1/notifications/read_all" do
    before { post_record.comments.create!(body: "Here to help", user: commenter) }

    it "marks everything read" do
      patch "/api/v1/notifications/read_all", headers: auth_headers_for(op), as: :json
      expect(response).to have_http_status(:ok)
      expect(op.notifications.unread.count).to eq(0)
    end
  end
end
