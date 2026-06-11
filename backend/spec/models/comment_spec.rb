require "rails_helper"

RSpec.describe Comment, type: :model do
  let(:op) { User.create!(name: "Olive", email: "olive@example.com", password: "password123") }
  let(:user) { User.create!(name: "Alice", email: "alice@example.com", password: "password123") }
  let(:post) { op.posts.create!(title: "My problem", body: "It is bad.") }
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

    context "when the commenter is the OP" do
      subject(:comment) { post.comments.build(body: "Replying in my own thread", user: op) }

      it "shows Anonymous with the op flag instead of the real name" do
        json = comment.as_json
        expect(json["author"]).to eq("Anonymous")
        expect(json["author_id"]).to be_nil
        expect(json["op"]).to be(true)
      end
    end

    context "when the commenter opts into anonymity" do
      subject(:comment) { post.comments.build(body: "Been there too.", user: user, anonymous: true) }

      it "hides the identity but is not the OP" do
        json = comment.as_json
        expect(json["author"]).to eq("Anonymous")
        expect(json["author_id"]).to be_nil
        expect(json["author_username"]).to be_nil
        expect(json["op"]).to be(false)
      end
    end
  end
end
