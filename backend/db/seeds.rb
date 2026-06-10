# Seed data for local development.
#
# Load with:  bin/rails db:seed   (bin/setup and bin/dev run db:prepare, which
# seeds a fresh database automatically via db:setup).
#
# Idempotent: re-running updates rather than duplicates. Skipped in production.
#
# ┌──────────────────────────────────────────────────────────────────────┐
# │  Demo login (all seeded users share this password)                     │
# │    email:     demo@itsanproblem.test                                   │
# │    password:  password123                                              │
# │                                                                        │
# │  Other seeded users: priya@ / sam@ / lena@ itsanproblem.test           │
# │  (same password)                                                       │
# └──────────────────────────────────────────────────────────────────────┘

if Rails.env.production?
  puts "Skipping demo seeds in production."
  return
end

password = "password123"

# ── Users ──────────────────────────────────────────────────────────────────
demo = User.find_or_create_by!(email: "demo@itsanproblem.test") do |u|
  u.name = "Demo User"
  u.password = password
  u.password_confirmation = password
end

commenters = %w[Priya Sam Lena].map do |name|
  User.find_or_create_by!(email: "#{name.downcase}@itsanproblem.test") do |u|
    u.name = name
    u.password = password
    u.password_confirmation = password
  end
end

# ── Posts (authored by the demo user; always shown as "Anonymous") ───────────
posts = [
  {
    title: "I keep procrastinating on everything that matters",
    body: "Every time I sit down to do important work I end up cleaning my desk or scrolling. How do you actually start?",
    comments: [
      "The two-minute rule helped me — commit to just two minutes and momentum usually takes over.",
      "Try blocking the first 25 minutes of your day for the one thing that matters most."
    ]
  },
  {
    title: "Burned out at work but scared to take a break",
    body: "I have not taken real time off in over a year and I can feel it. But I worry things will fall apart without me.",
    comments: [
      "Things rarely fall apart. The team covering for you is also how they grow.",
      "Start with one fully-offline weekend before booking a longer break."
    ]
  },
  {
    title: "Moved to a new city and I have no friends here",
    body: "It has been three months and I still spend most weekends alone. Not sure how adults make friends.",
    comments: [
      "Recurring events beat one-off meetups — a weekly class or run club makes familiarity build up.",
      "Say yes to everything for the first few months, even things you would normally skip."
    ]
  },
  {
    title: "Can't decide between a safe job and a risky startup",
    body: "One offer is stable and boring, the other is exciting but could vanish in a year. I keep flip-flopping.",
    comments: [
      "Ask which decision you can recover from more easily if it goes wrong."
    ]
  }
]

posts.each do |attrs|
  post = demo.posts.find_or_create_by!(title: attrs[:title]) do |p|
    p.body = attrs[:body]
  end

  attrs[:comments].each_with_index do |body, i|
    author = commenters[i % commenters.size]
    post.comments.find_or_create_by!(body: body) do |c|
      c.user = author
    end
  end
end

# ── Stats (kept consistent with the seeded comments) ─────────────────────────
User.find_each do |user|
  stat = UserStat.for_user(user)
  # helpful_points = comments other people left on this user's posts.
  helpful = Comment.joins(:post).where(posts: {user_id: user.id}).count
  stat.update!(comment_count: user.comments.count, helpful_points: helpful)
end

puts "Seeded #{User.count} users, #{Post.count} posts, #{Comment.count} comments."
puts "Login: demo@itsanproblem.test / #{password}"
