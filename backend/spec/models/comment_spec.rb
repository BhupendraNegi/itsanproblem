require 'rails_helper'

RSpec.describe Comment, type: :model do
  let(:user) { User.create!(name: "Alice", email: "alice@example.com", password: "password123") }
  let(:post) { user.posts.create!(title: "My problem", body: "It is bad.") }
  subject(:comment) { post.comments.build(body: "Have you tried turning it off?", user: user) }

  describe "validations" do
    it { is_expected.to be_valid }

    it "requires a body" do
      comment.body = ""
      expect(comment).not_to be_valid
    end
  end

  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:post) }
  end

  describe "#as_json" do
    before { comment.save! }

    it "includes id, body, and created_at" do
      json = comment.as_json
      expect(json.keys).to include("id", "body", "created_at")
    end

    it "includes the author's name" do
      expect(comment.as_json["author"]).to eq("Alice")
    end

    it "includes the author's user_id" do
      expect(comment.as_json["author_id"]).to eq(user.id)
    end

    it "does not expose user_id directly" do
      expect(comment.as_json.keys).not_to include("user_id")
    end
  end
end
