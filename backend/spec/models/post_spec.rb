require "rails_helper"

RSpec.describe Post, type: :model do
  let(:user) { User.create!(name: "Alice", email: "alice@example.com", password: "password123") }
  subject(:post) { user.posts.build(title: "My problem", body: "It is bad.") }

  describe "validations" do
    it { is_expected.to be_valid }

    it "requires a title" do
      post.title = ""
      expect(post).not_to be_valid
    end

    it "requires a body" do
      post.body = ""
      expect(post).not_to be_valid
    end

    it "caps title at 120 and body at 5000 characters" do
      post.title = "x" * 121
      expect(post).not_to be_valid
      post.title = "x" * 120
      post.body = "x" * 5001
      expect(post).not_to be_valid
      post.body = "x" * 5000
      expect(post).to be_valid
    end
  end

  describe "associations" do
    it { is_expected.to have_one(:post_author).dependent(:destroy) }
    it { is_expected.to have_one(:author_user).through(:post_author).source(:user) }
    it { is_expected.to have_many(:comments).dependent(:destroy) }
  end

  describe "anon handle" do
    it "assigns a stable handle on creation" do
      post.save!
      expect(post.anon_handle).to match(/\Aanon_\h{4}\z/)
      expect(post.reload.anon_handle).to eq(post.anon_handle)
    end

    it "records authorship in the post_authors ledger, not on the post" do
      post.save!
      expect(post.attributes).not_to have_key("user_id")
      expect(post.author_user_id).to eq(user.id)
    end
  end

  describe "#as_json" do
    before { post.save! }

    it "exposes id, title, body, and created_at" do
      json = post.as_json
      expect(json.keys).to include("id", "title", "body", "created_at")
    end

    it "sets author to Anonymous" do
      expect(post.as_json["author"]).to eq("Anonymous")
    end

    it "does not expose user_id" do
      expect(post.as_json.keys).not_to include("user_id")
    end

    it "includes comments array" do
      expect(post.as_json["comments"]).to eq([])
    end
  end
end
