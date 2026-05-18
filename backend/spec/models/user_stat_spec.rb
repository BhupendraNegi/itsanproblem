require 'rails_helper'

RSpec.describe UserStat, type: :model do
  let(:user) { User.create!(name: "Alice", email: "alice@example.com", password: "password123") }

  describe "associations" do
    it { is_expected.to belong_to(:user) }
  end

  describe ".for_user" do
    context "when no stat exists" do
      it "creates a new stat with defaults" do
        stat = UserStat.for_user(user)
        expect(stat).to be_persisted
        expect(stat.helpful_points).to eq(0)
        expect(stat.user).to eq(user)
      end

      it "sets comment_count from existing comments" do
        post = user.posts.create!(title: "t", body: "b")
        other = User.create!(name: "Bob", email: "bob@example.com", password: "password123")
        post.comments.create!(body: "reply", user: other)

        stat = UserStat.for_user(other)
        expect(stat.comment_count).to eq(1)
      end
    end

    context "when a stat already exists" do
      it "returns the existing record without creating a duplicate" do
        existing = UserStat.create!(user: user, helpful_points: 5, comment_count: 3)
        stat = UserStat.for_user(user)
        expect(stat.id).to eq(existing.id)
        expect(UserStat.where(user: user).count).to eq(1)
      end
    end
  end
end
