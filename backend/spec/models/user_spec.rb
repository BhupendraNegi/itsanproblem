require "rails_helper"

RSpec.describe User, type: :model do
  subject(:user) { User.new(name: "Alice", email: "alice@example.com", password: "password123") }

  describe "validations" do
    it { is_expected.to be_valid }

    it "requires a name" do
      user.name = ""
      expect(user).not_to be_valid
      expect(user.errors[:name]).to include("can't be blank")
    end

    it "requires an email" do
      user.email = ""
      expect(user).not_to be_valid
    end

    it "requires a unique email" do
      user.save!
      duplicate = User.new(name: "Bob", email: "alice@example.com", password: "password123")
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:email]).to include("has already been taken")
    end

    it "requires a password of at least 6 characters" do
      user.password = "short"
      expect(user).not_to be_valid
    end
  end

  describe "username" do
    it "auto-generates from the name on create" do
      user.save!
      expect(user.username).to eq("alice")
    end

    it "accepts an explicit username and normalizes case" do
      user.username = "Alice_99"
      user.save!
      expect(user.username).to eq("alice_99")
    end

    it "rejects invalid formats" do
      ["ab", "has space", "UPPER!", "12345"].each do |bad|
        user.username = bad
        expect(user).not_to be_valid, "expected #{bad.inspect} to be invalid"
      end
    end

    it "enforces uniqueness by generating a different username" do
      User.create!(name: "Alice", email: "other@example.com", password: "password123")
      user.save!
      expect(user.username).to start_with("alice")
      expect(user.username).not_to eq("alice")
    end
  end

  describe "associations" do
    it { is_expected.to have_many(:post_authors).dependent(:destroy) }
    it { is_expected.to have_many(:posts).through(:post_authors) }
    it { is_expected.to have_many(:comments).dependent(:destroy) }
    it { is_expected.to have_one(:user_stat).dependent(:destroy) }

    it "destroys authored posts when the account is destroyed" do
      user.save!
      post = user.posts.create!(title: "t", body: "b")
      user.destroy!
      expect(Post.exists?(post.id)).to be(false)
    end
  end
end
