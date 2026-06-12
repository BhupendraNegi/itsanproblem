require "rails_helper"

RSpec.describe Badges do
  let!(:user) { User.create!(name: "Alice", email: "alice@example.com", password: "password123") }
  let!(:op) { User.create!(name: "Olive", email: "olive@example.com", password: "password123") }

  def badges_for(u)
    UserStat.for_user(u).reload.badges
  end

  it "awards first_post on posting" do
    expect(badges_for(user)).to be_empty
    user.posts.create!(title: "First", body: "x")
    expect(badges_for(user)).to include("first_post")
  end

  it "awards first_reply on commenting" do
    post = op.posts.create!(title: "P", body: "x")
    post.comments.create!(body: "Here to help", user: user)
    expect(badges_for(user)).to include("first_reply")
  end

  it "awards honest_neighbor at 3 helpful points" do
    post = op.posts.create!(title: "P", body: "x")
    3.times do |n|
      comment = op.posts.create!(title: "P#{n}", body: "x").comments.create!(body: "advice #{n}", user: user)
      comment.helpful_marks.create!(user: comment.post.author_user)
    end
    _ = post
    expect(UserStat.for_user(user).helpful_points).to eq(3)
    expect(badges_for(user)).to include("honest_neighbor")
    expect(badges_for(user)).not_to include("trusted_voice")
  end

  it "awards conversation_starter when a post draws 5 replies" do
    post = user.posts.create!(title: "Busy thread", body: "x")
    5.times do |n|
      replier = User.create!(name: "R#{n}", email: "r#{n}@example.com", password: "password123")
      post.comments.create!(body: "reply #{n}", user: replier)
    end
    expect(badges_for(user)).to include("conversation_starter")
  end

  it "awards crowd_favorite when one reply gets 10 marks" do
    post = op.posts.create!(title: "P", body: "x")
    comment = post.comments.create!(body: "great advice", user: user)
    10.times do |n|
      fan = User.create!(name: "F#{n}", email: "f#{n}@example.com", password: "password123")
      comment.helpful_marks.create!(user: fan)
    end
    expect(badges_for(user)).to include("crowd_favorite")
  end

  it "never revokes a badge" do
    post = user.posts.create!(title: "First", body: "x")
    expect(badges_for(user)).to include("first_post")
    post.destroy!
    Badges.refresh!(user)
    expect(badges_for(user)).to include("first_post")
  end

  it "exposes earned badges with names on the profile" do
    user.posts.create!(title: "First", body: "x")
    get_user = User.create!(name: "Viewer", email: "v@example.com", password: "password123")
    _ = get_user
    entries = Badges.for_keys(badges_for(user))
    expect(entries.first).to include(key: "first_post", name: "First post")
  end
end
